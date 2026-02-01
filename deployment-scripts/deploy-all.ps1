param(
  [string]$ApiTag = "1.0",
  [string]$WebTag = "1.0"
)

# -----------------------------
# CONFIG (BookWise / Azure)
# -----------------------------
$RG         = "rg-bookwise"
$ACR_NAME   = "bookwiseacr4821"
$ACR_SERVER = "$ACR_NAME.azurecr.io"
$API_APP    = "bookwise-api"
$WEB_APP    = "bookwise-web"

# Update these if your local repo path differs
$API_PATH = "C:\Users\rcomp\source\repos\d424-software-engineering-capstone\AccountingApp"
$WEB_PATH = "C:\Users\rcomp\source\repos\d424-software-engineering-capstone\client\accounting-ng"

# -----------------------------
# LOGIN
# -----------------------------
Write-Host "Logging in to Azure..."
az login | Out-Null

Write-Host "Logging in to ACR ($ACR_NAME)..."
az acr login --name $ACR_NAME

# -----------------------------
# BUILD + PUSH API
# -----------------------------
$API_IMAGE_LOCAL = "bookwise-api:local"
$API_IMAGE_ACR   = "$ACR_SERVER/bookwise-api:$ApiTag"

Write-Host "Building API image..."
Set-Location $API_PATH
docker build -t $API_IMAGE_LOCAL .

Write-Host "Tagging API image..."
docker tag $API_IMAGE_LOCAL $API_IMAGE_ACR

Write-Host "Pushing API image..."
docker push $API_IMAGE_ACR

# -----------------------------
# BUILD + PUSH WEB
# -----------------------------
$WEB_IMAGE_LOCAL = "bookwise-web:local"
$WEB_IMAGE_ACR   = "$ACR_SERVER/bookwise-web:$WebTag"

Write-Host "Building WEB image..."
Set-Location $WEB_PATH
docker build -t $WEB_IMAGE_LOCAL .

Write-Host "Tagging WEB image..."
docker tag $WEB_IMAGE_LOCAL $WEB_IMAGE_ACR

Write-Host "Pushing WEB image..."
docker push $WEB_IMAGE_ACR

# -----------------------------
# DEPLOY (UPDATE CONTAINER APPS)
# -----------------------------
Write-Host "Updating API Container App..."
az containerapp update `
  --name $API_APP `
  --resource-group $RG `
  --image $API_IMAGE_ACR

Write-Host "Updating WEB Container App..."
az containerapp update `
  --name $WEB_APP `
  --resource-group $RG `
  --image $WEB_IMAGE_ACR

# -----------------------------
# SHOW RESULTS
# -----------------------------
Write-Host "`nDeployed URLs:"
$webFqdn = az containerapp show --name $WEB_APP --resource-group $RG --query "properties.configuration.ingress.fqdn" --output tsv
$apiFqdn = az containerapp show --name $API_APP --resource-group $RG --query "properties.configuration.ingress.fqdn" --output tsv

Write-Host "WEB: https://$webFqdn"
Write-Host "API: https://$apiFqdn/swagger"

Write-Host "`nRunning images:"
Write-Host "WEB image:"
az containerapp show --name $WEB_APP --resource-group $RG --query "properties.template.containers[0].image" --output tsv
Write-Host "API image:"
az containerapp show --name $API_APP --resource-group $RG --query "properties.template.containers[0].image" --output tsv
