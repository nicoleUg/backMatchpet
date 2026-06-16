using System;
using PetMatch.Domain.Enums;

namespace PetMatch.API.DTOs;

public class SwipeDto
{
    public Guid PetId { get; set; }
    public SwipeDirection Direction { get; set; }
}
