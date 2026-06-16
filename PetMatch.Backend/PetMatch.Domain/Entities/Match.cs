using System;

namespace PetMatch.Domain.Entities;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AdopterId { get; set; }
    public User? Adopter { get; set; }
    
    public Guid PetId { get; set; }
    public Pet? Pet { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsMutual { get; set; } = false;
}
