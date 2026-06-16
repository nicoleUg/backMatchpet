using System;
using System.Threading.Tasks;
using PetMatch.Application.Interfaces;
using PetMatch.Domain.Entities;
using PetMatch.Domain.Enums;

namespace PetMatch.Application.Services;

public class MatchService
{
    private readonly IMatchRepository _matchRepository;

    public MatchService(IMatchRepository matchRepository)
    {
        _matchRepository = matchRepository;
    }

    /// <summary>
    /// Procesa el deslizamiento (Swipe) de un usuario hacia una mascota.
    /// Retorna true si se formó un Match mutuo, falso de lo contrario.
    /// </summary>
    public async Task<bool> ProcessSwipeAsync(Guid adopterId, Guid petId, SwipeDirection direction)
    {
        if (direction != SwipeDirection.Right)
        {
            // Solo procesamos los "Likes" (Right swipe). Si es a la izquierda, lo ignoramos o podríamos registrar el "dislike" si hubiera otra entidad.
            return false;
        }

        var existingMatch = await _matchRepository.GetMatchAsync(adopterId, petId);

        if (existingMatch != null)
        {
            // Si ya existe un registro (ej. el refugio ya le dio like al perfil del adoptante para esta mascota, 
            // o el adoptante ya le había dado like), validamos si podemos consolidar el Match mutuo.
            if (!existingMatch.IsMutual)
            {
                existingMatch.IsMutual = true;
                await _matchRepository.UpdateAsync(existingMatch);
                return true; // Es un match mutuo!
            }
            return false; // Ya era mutuo
        }

        // Si no existía interacción previa, creamos una nueva marcando el interés.
        // Nota: En una app real, si el refugio hace swipe al usuario, el registro sería ligeramente distinto 
        // o requeriría un flag de quién inició el like. Para simplificar según el requerimiento:
        var newMatch = new Match
        {
            AdopterId = adopterId,
            PetId = petId,
            IsMutual = false, // Todavía no es mutuo
            CreatedAt = DateTime.UtcNow
        };

        await _matchRepository.AddAsync(newMatch);
        return false;
    }
}
