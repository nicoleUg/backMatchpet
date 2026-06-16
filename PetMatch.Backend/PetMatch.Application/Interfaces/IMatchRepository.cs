using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PetMatch.Domain.Entities;

namespace PetMatch.Application.Interfaces;

public interface IMatchRepository
{
    Task<Match?> GetMatchAsync(Guid adopterId, Guid petId);
    Task AddAsync(Match match);
    Task UpdateAsync(Match match);
    Task<IEnumerable<Match>> GetMatchesForAdopterAsync(Guid adopterId);
    Task<IEnumerable<Match>> GetMatchesForShelterAsync(Guid shelterId);
}
