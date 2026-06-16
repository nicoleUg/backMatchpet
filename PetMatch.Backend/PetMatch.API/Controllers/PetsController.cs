using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetMatch.API.DTOs;
using PetMatch.Application.Interfaces;
using PetMatch.Application.Services;
using PetMatch.Domain.Entities;

namespace PetMatch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protección por defecto para todos los endpoints
public class PetsController : ControllerBase
{
    private readonly IPetRepository _petRepository;
    private readonly PetService _petService;

    public PetsController(IPetRepository petRepository, PetService petService)
    {
        _petRepository = petRepository;
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets([FromQuery] string? size, [FromQuery] string? species, [FromQuery] string? energyLevel)
    {
        var pets = await _petRepository.GetAllAsync();
        
        // Simulación de filtros avanzados en memoria (idealmente esto iría en el repositorio usando IQueryable)
        // Para respetar la simplicidad, aplicaremos LINQ to Objects aquí.
        var filteredPets = pets;

        if (!string.IsNullOrEmpty(size))
            filteredPets = filteredPets.Where(p => p.Size.Equals(size, StringComparison.OrdinalIgnoreCase));
        
        if (!string.IsNullOrEmpty(species))
            filteredPets = filteredPets.Where(p => p.Species.Equals(species, StringComparison.OrdinalIgnoreCase));
            
        if (!string.IsNullOrEmpty(energyLevel))
            filteredPets = filteredPets.Where(p => p.EnergyLevel.Equals(energyLevel, StringComparison.OrdinalIgnoreCase));

        return Ok(filteredPets);
    }

    [HttpPost]
    [Authorize(Roles = "Shelter")] // Solo los refugios pueden crear
    public async Task<IActionResult> CreatePet([FromBody] RegisterPetDto dto)
    {
        // Obtener el ID del refugio desde el token
        var shelterIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (shelterIdClaim == null) return Unauthorized();

        var pet = new Pet
        {
            ShelterId = Guid.Parse(shelterIdClaim),
            Name = dto.Name,
            Species = dto.Species,
            Size = dto.Size,
            AgeRange = dto.AgeRange,
            EnergyLevel = dto.EnergyLevel,
            IsKidFriendly = dto.IsKidFriendly,
            IsPetFriendly = dto.IsPetFriendly,
            MedicalHistory = dto.MedicalHistory,
            PhotoUrls = dto.PhotoUrls,
            IsAdopted = false
        };

        try
        {
            var createdPet = await _petService.RegisterPetAsync(pet);
            return CreatedAtAction(nameof(GetPets), new { id = createdPet.Id }, createdPet);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Shelter")]
    public async Task<IActionResult> UpdatePet(Guid id, [FromBody] RegisterPetDto dto)
    {
        var shelterIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (shelterIdClaim == null) return Unauthorized();

        var existingPet = await _petRepository.GetByIdAsync(id);
        if (existingPet == null) return NotFound();

        if (existingPet.ShelterId != Guid.Parse(shelterIdClaim))
            return Forbid(); // No puede modificar una mascota que no es suya

        existingPet.Name = dto.Name;
        existingPet.Species = dto.Species;
        existingPet.Size = dto.Size;
        existingPet.AgeRange = dto.AgeRange;
        existingPet.EnergyLevel = dto.EnergyLevel;
        existingPet.IsKidFriendly = dto.IsKidFriendly;
        existingPet.IsPetFriendly = dto.IsPetFriendly;
        existingPet.MedicalHistory = dto.MedicalHistory;
        existingPet.PhotoUrls = dto.PhotoUrls;

        await _petRepository.UpdateAsync(existingPet);
        return NoContent();
    }
}
