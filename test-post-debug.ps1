$body = @{
    userId = "69f139f8028d87304e5ce777"
    title = "Debug Post"
    content = "Debug content"
    mood = "happy"
} | ConvertTo-Json

Write-Host "Creating post..."
$res = Invoke-WebRequest -Uri 'http://localhost:3000/api/posts' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
$post = $res.Content | ConvertFrom-Json
Write-Host "Created post ID: $($post._id)"
Write-Host "ID Type: $($post._id.GetType().Name)"

Write-Host "`nTrying to fetch it..."
try {
    $fetchRes = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$($post._id)" -UseBasicParsing
    Write-Host "✅ Fetch successful!"
    $fetchRes.Content | ConvertFrom-Json | Select-Object _id, title
} catch {
    Write-Host "❌ Fetch failed: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)"
}
