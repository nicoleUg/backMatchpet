using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PetMatch.Domain.Entities;

namespace PetMatch.Application.Interfaces;

public interface IPetRepository
{
    Task<IEnumerable<Pet>> GetAllAsync();
    Task<Pet?> GetByIdAsync(Guid id);
    Task AddAsync(Pet pet);
    Task UpdateAsync(Pet pet);
    Task DeleteAsync(Guid id);
}
