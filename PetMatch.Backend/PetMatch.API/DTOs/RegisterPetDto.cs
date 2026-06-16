using System.Collections.Generic;

namespace PetMatch.API.DTOs;

public class RegisterPetDto
{
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string AgeRange { get; set; } = string.Empty;
    public string EnergyLevel { get; set; } = string.Empty;
    public bool IsKidFriendly { get; set; }
    public bool IsPetFriendly { get; set; }
    public string MedicalHistory { get; set; } = "{}";
    public List<string> PhotoUrls { get; set; } = new();
}
