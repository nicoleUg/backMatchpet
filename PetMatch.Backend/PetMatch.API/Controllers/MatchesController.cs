using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetMatch.API.DTOs;
using PetMatch.Application.Services;

namespace PetMatch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MatchesController : ControllerBase
{
    private readonly MatchService _matchService;

    public MatchesController(MatchService matchService)
    {
        _matchService = matchService;
    }

    [HttpPost]
    public async Task<IActionResult> Swipe([FromBody] SwipeDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var adopterId = Guid.Parse(userIdClaim);

        var isMutual = await _matchService.ProcessSwipeAsync(adopterId, dto.PetId, dto.Direction);

        return Ok(new { IsMutualMatch = isMutual });
    }
}
