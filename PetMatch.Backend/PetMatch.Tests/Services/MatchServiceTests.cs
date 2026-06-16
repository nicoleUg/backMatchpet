using System;
using System.Threading.Tasks;
using Moq;
using PetMatch.Application.Interfaces;
using PetMatch.Application.Services;
using PetMatch.Domain.Enums;
using Xunit;

// Alias to resolve ambiguity between Moq.Match and PetMatch.Domain.Entities.Match
using DomainMatch = PetMatch.Domain.Entities.Match;

namespace PetMatch.Tests.Services;

public class MatchServiceTests
{
    private readonly Mock<IMatchRepository> _mockMatchRepository;
    private readonly MatchService _matchService;

    public MatchServiceTests()
    {
        _mockMatchRepository = new Mock<IMatchRepository>();
        _matchService = new MatchService(_mockMatchRepository.Object);
    }

    [Fact]
    public async Task ProcessSwipeAsync_LeftSwipe_ShouldReturnFalseAndNotCallRepository()
    {
        // Arrange
        var adopterId = Guid.NewGuid();
        var petId = Guid.NewGuid();

        // Act
        var result = await _matchService.ProcessSwipeAsync(adopterId, petId, SwipeDirection.Left);

        // Assert
        Assert.False(result);
        _mockMatchRepository.Verify(repo => repo.GetMatchAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        _mockMatchRepository.Verify(repo => repo.AddAsync(It.IsAny<DomainMatch>()), Times.Never);
    }

    [Fact]
    public async Task ProcessSwipeAsync_RightSwipe_NoExistingMatch_ShouldCreateNewMatchAndReturnFalse()
    {
        // Arrange
        var adopterId = Guid.NewGuid();
        var petId = Guid.NewGuid();

        _mockMatchRepository
            .Setup(repo => repo.GetMatchAsync(adopterId, petId))
            .ReturnsAsync((DomainMatch?)null);

        // Act
        var result = await _matchService.ProcessSwipeAsync(adopterId, petId, SwipeDirection.Right);

        // Assert
        Assert.False(result); // Aún no es mutuo
        _mockMatchRepository.Verify(repo => repo.AddAsync(It.Is<DomainMatch>(m => m.AdopterId == adopterId && m.PetId == petId && !m.IsMutual)), Times.Once);
    }

    [Fact]
    public async Task ProcessSwipeAsync_RightSwipe_ExistingNonMutualMatch_ShouldUpdateToMutualAndReturnTrue()
    {
        // Arrange
        var adopterId = Guid.NewGuid();
        var petId = Guid.NewGuid();
        var existingMatch = new DomainMatch
        {
            AdopterId = adopterId,
            PetId = petId,
            IsMutual = false
        };

        _mockMatchRepository
            .Setup(repo => repo.GetMatchAsync(adopterId, petId))
            .ReturnsAsync(existingMatch);

        // Act
        var result = await _matchService.ProcessSwipeAsync(adopterId, petId, SwipeDirection.Right);

        // Assert
        Assert.True(result); // ¡Es un match mutuo!
        Assert.True(existingMatch.IsMutual);
        _mockMatchRepository.Verify(repo => repo.UpdateAsync(existingMatch), Times.Once);
    }
    
    [Fact]
    public async Task ProcessSwipeAsync_RightSwipe_ExistingMutualMatch_ShouldReturnFalseAndNotUpdate()
    {
        // Arrange
        var adopterId = Guid.NewGuid();
        var petId = Guid.NewGuid();
        var existingMatch = new DomainMatch
        {
            AdopterId = adopterId,
            PetId = petId,
            IsMutual = true
        };

        _mockMatchRepository
            .Setup(repo => repo.GetMatchAsync(adopterId, petId))
            .ReturnsAsync(existingMatch);

        // Act
        var result = await _matchService.ProcessSwipeAsync(adopterId, petId, SwipeDirection.Right);

        // Assert
        Assert.False(result); // Ya era mutuo, por ende la acción no genera un nuevo match
        _mockMatchRepository.Verify(repo => repo.UpdateAsync(It.IsAny<DomainMatch>()), Times.Never);
    }
}
