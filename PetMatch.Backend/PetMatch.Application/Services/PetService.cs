using System;
using System.Threading.Tasks;
using PetMatch.Application.Interfaces;
using PetMatch.Domain.Entities;

namespace PetMatch.Application.Services;

public class PetService
{
    private readonly IPetRepository _petRepository;

    public PetService(IPetRepository petRepository)
    {
        _petRepository = petRepository;
    }

    public async Task<Pet> RegisterPetAsync(Pet pet)
    {
        // Validaciones de negocio
        if (string.IsNullOrWhiteSpace(pet.Name))
            throw new ArgumentException("El nombre de la mascota es requerido.");
        
        if (string.IsNullOrWhiteSpace(pet.Species))
            throw new ArgumentException("La especie de la mascota es requerida.");

        // Requisitos mínimos de salud (Ejemplo: el historial médico no debe estar vacío para indicar que fue revisado)
        if (string.IsNullOrWhiteSpace(pet.MedicalHistory) || pet.MedicalHistory == "{}")
            throw new InvalidOperationException("La mascota debe contar con un historial médico inicial válido.");

        await _petRepository.AddAsync(pet);
        return pet;
    }
}
