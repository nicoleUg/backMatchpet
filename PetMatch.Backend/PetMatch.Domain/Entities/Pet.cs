using System;
using System.Collections.Generic;

namespace PetMatch.Domain.Entities;

public class Pet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty; // Small, Medium, Large
    public string AgeRange { get; set; } = string.Empty; // Puppy, Young, Adult, Senior
    public string EnergyLevel { get; set; } = string.Empty; // Low, Medium, High
    public bool IsKidFriendly { get; set; }
    public bool IsPetFriendly { get; set; }
    public string MedicalHistory { get; set; } = string.Empty; // Store as JSON string
    public List<string> PhotoUrls { get; set; } = new();
    public bool IsAdopted { get; set; } = false;
    
    // Relación
    public Guid ShelterId { get; set; }
    public User? Shelter { get; set; }
}
