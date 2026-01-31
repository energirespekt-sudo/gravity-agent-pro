#pragma once
#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "NexusSaveGame.generated.h"

/**
 * MASTER SAVE SYSTEM
 * Säkrar: Level Progress, High Scores, och "The Vault" (upplåsta emojis).
 */
UCLASS()
class NEXUSPROJECT_API UNexusSaveGame : public USaveGame
{
    GENERATED_BODY()

public:
    UPROPERTY(VisibleAnywhere, Category = "Progress")
    int32 CurrentLevelIndex; // Håller koll på om du är på Level 1 eller 50.

    UPROPERTY(VisibleAnywhere, Category = "Stats")
    TMap<int32, float> LevelHighScores; // Sparar poäng per level.

    UPROPERTY(VisibleAnywhere, Category = "The Vault")
    TArray<FString> UnlockedBadEmojis; // Sparar dina vunna "Bad Emojis".

    UPROPERTY(VisibleAnywhere, Category = "Settings")
    float MasterVolume; // Sparar ljudinställningar.

    UNexusSaveGame()
    {
        CurrentLevelIndex = 1;
        MasterVolume = 1.0f;
    }
};
