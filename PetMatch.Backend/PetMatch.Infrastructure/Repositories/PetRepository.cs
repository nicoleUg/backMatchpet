using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PetMatch.Application.Interfaces;
using PetMatch.Domain.Entities;
using PetMatch.Infrastructure.Data;

namespace PetMatch.Infrastructure.Repositories;

public class PetRepository : IPetRepository
{
    private readonly ApplicationDbContext _context;

    public PetRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Pet>> GetAllAsync()
    {
        return await _context.Pets.ToListAsync();
    }

    public async Task<Pet?> GetByIdAsync(Guid id)
    {
        return await _context.Pets.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Pet pet)
    {
        await _context.Pets.AddAsync(pet);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Pet pet)
    {
        _context.Pets.Update(pet);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var pet = await GetByIdAsync(id);
        if (pet != null)
        {
            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
        }
    }
}
