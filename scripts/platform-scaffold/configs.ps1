# Platform scaffold configs - used by push-platform-scaffolds.ps1
# Ensure-PlatformScaffold creates api/, workers/, docs/, tests/, .github/ if missing.

$script:PlatformScaffoldConfigs = @{
    billing = @{
        Name = "dakinis-billing"
        Port = 4080
        GatewayPrefix = "billing"
        Domain = "billing.dakinissystems.com"
        Description = "Platform billing service"
        HasWorker = $false
        LegacySrc = "src"
        GithubDescription = "Platform billing for Dakinis Systems - Stripe subscriptions, plans, invoices and usage metering."
    }
    notifications = @{
        Name = "dakinis-notifications"
        Port = 4081
        GatewayPrefix = "notifications"
        Domain = "notifications.dakinissystems.com"
        Description = "Platform notifications"
        HasWorker = $true
        LegacySrc = "src"
        GithubDescription = "Platform notifications for Dakinis Systems - email, push, in-app and multi-channel delivery."
    }
    search = @{
        Name = "dakinis-search"
        Port = 4082
        GatewayPrefix = "search"
        Domain = "search.dakinissystems.com"
        Description = "Platform search"
        HasWorker = $true
        LegacySrc = "src"
        GithubDescription = "Global search platform for Dakinis Systems - unified index, scopes and semantic search."
    }
    knowledge = @{
        Name = "dakinis-knowledge"
        Port = 4084
        GatewayPrefix = "knowledge"
        Domain = "knowledge.dakinissystems.com"
        Description = "Platform knowledge"
        HasWorker = $true
        LegacySrc = $null
        GithubDescription = "Knowledge platform for Dakinis Systems with document ingestion, RAG and semantic search."
    }
    internal = @{
        Name = "dakinis-internal-api"
        Port = 4083
        GatewayPrefix = "internal"
        Domain = "api.dakinissystems.com/internal"
        Description = "Platform internal API"
        HasWorker = $false
        LegacySrc = "src"
        GithubDescription = "Internal API gateway for Dakinis platform services - service-to-service proxy."
    }
}
