using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PetMatch.Application.Interfaces;
using PetMatch.Domain.Entities;
using PetMatch.Infrastructure.Data;

namespace PetMatch.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;

    public MatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Match?> GetMatchAsync(Guid adopterId, Guid petId)
    {
        return await _context.Matches
            .FirstOrDefaultAsync(m => m.AdopterId == adopterId && m.PetId == petId);
    }

    public async Task AddAsync(Match match)
    {
        await _context.Matches.AddAsync(match);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Match match)
    {
        _context.Matches.Update(match);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Match>> GetMatchesForAdopterAsync(Guid adopterId)
    {
        return await _context.Matches
            .Include(m => m.Pet)
            .Where(m => m.AdopterId == adopterId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetMatchesForShelterAsync(Guid shelterId)
    {
        return await _context.Matches
            .Include(m => m.Pet)
            .Include(m => m.Adopter)
            .Where(m => m.Pet!.ShelterId == shelterId)
            .ToListAsync();
    }
}
