using Microsoft.EntityFrameworkCore;
using PetMatch.Domain.Entities;

namespace PetMatch.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Pet> Pets { get; set; } = null!;
    public DbSet<Match> Matches { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Match>()
            .HasOne(m => m.Adopter)
            .WithMany()
            .HasForeignKey(m => m.AdopterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Match>()
            .HasOne(m => m.Pet)
            .WithMany()
            .HasForeignKey(m => m.PetId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Shelter)
            .WithMany()
            .HasForeignKey(p => p.ShelterId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Map MedicalHistory string as a regular column (can hold JSON)
        modelBuilder.Entity<Pet>()
            .Property(p => p.MedicalHistory)
            .HasColumnType("nvarchar(max)");
    }
}
