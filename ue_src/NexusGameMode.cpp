#include "NexusGameMode.h"

void ANexusGameMode::StartLevel(int32 LevelIndex)
{
    // 1. Hämta data för nivån (Spawn Rate, Word List)
    CurrentLevelData = LevelDatabase->GetRow(LevelIndex);

    // 2. Justera svårighetsgraden baserat på din vision
    float SpawnRate = 2.0f; // Startvärde
    
    if (LevelIndex > 10) SpawnRate = 1.5f; // Öka farten
    if (LevelIndex > 30) SpawnRate = 0.8f; // KAOS (Fas 3)
    if (LevelIndex == 50) SpawnRate = 0.4f; // THE VOID (Överlevnad)

    // 3. Starta Timern
    GetWorldTimerManager().SetTimer(SpawnTimerHandle, this, &ANexusGameMode::SpawnNextEmoji, SpawnRate, true);
    
    UE_LOG(LogTemp, Warning, TEXT("NEXUS: LEVEL %d INITIATED. GLITCH PROBABILITY: %f"), LevelIndex, CurrentLevelData->BadEmojiChance);
}

void ANexusGameMode::SpawnNextEmoji()
{
    // Hämta en emoji från Object Pool (skapar ingen ny, sparar prestanda)
    AEmojiProjectile* NewEmoji = ObjectPool->GetPooledActor();

    // Ska det vara en "Bad Emoji"?
    bool bGlitch = FMath::FRand() < CurrentLevelData->BadEmojiChance;
    
    FString Word = bGlitch ? GetRandomGlitchWord() : GetRandomStandardWord();

    // Skjut iväg den
    NewEmoji->ActivateFromPool(Word, bGlitch, CurrentLevelData->FallSpeed);
}
