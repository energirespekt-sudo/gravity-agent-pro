#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EmojiProjectile.generated.h"

UCLASS()
class NEXUSPROJECT_API AEmojiProjectile : public AActor
{
    GENERATED_BODY()

public:
    // --- CORE IDENTITY ---
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Data")
    FString TargetWord; // Ordet spelaren ska skriva (t.ex. "PUFF" eller "BIL").

    // --- THE GLITCH LOGIC ---
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Visuals")
    bool bIsBadEmoji; // Om TRUE -> Aktivera Glitch Shader & Ryckig fysik.

    // --- POOLING SYSTEM (OPTIMIZATION) ---
    // Istället för att förstöras, inaktiveras den och väntar på nytt spawn.
    UFUNCTION(BlueprintCallable, Category = "Optimization")
    void DeactivateToPool(); 

    UFUNCTION(BlueprintCallable, Category = "Optimization")
    void ActivateFromPool(FString NewWord, bool bBadGlitch, float Speed);

protected:
    virtual void Tick(float DeltaTime) override;
    
    // Hanterar fallet (Gravity Agents fysik)
    void HandleMovement(float DeltaTime);
};
