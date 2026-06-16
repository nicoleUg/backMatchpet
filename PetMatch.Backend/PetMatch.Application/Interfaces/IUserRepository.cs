using System;
using System.Threading.Tasks;
using PetMatch.Domain.Entities;

namespace PetMatch.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}
