$postId = "69f13b56028d87304e5ce77f"
$userId = "69f13b46028d87304e5ce77d"

Write-Host "=== Testing UPDATE ===" -ForegroundColor Cyan

$updateBody = @{
    userId = $userId
    title = "Testing Blog Post Creation - UPDATED"
    content = "I successfully fixed all the blog posting issues today. Updated content!"
    mood = "reflective"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$postId" -Method PUT -ContentType "application/json" -Body $updateBody -UseBasicParsing
    $post = $response.Content | ConvertFrom-Json
    Write-Host "✅ Update Success!"
    Write-Host "Title: $($post.title)"
    Write-Host "Mood: $($post.mood)"
} catch {
    Write-Host "❌ Update Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Testing GET (verify update) ===" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$postId" -UseBasicParsing
    $post = $response.Content | ConvertFrom-Json
    Write-Host "✅ Fetch Success!"
    Write-Host "Title: $($post.title)"
    Write-Host "Mood: $($post.mood)"
    if ($post.title -like "*UPDATED*") {
        Write-Host "✅ Update was saved to database!"
    }
} catch {
    Write-Host "❌ Fetch Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Testing DELETE ===" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$postId`?userId=$userId" -Method DELETE -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Delete Success!"
    Write-Host "Result: $($result.success)"
} catch {
    Write-Host "❌ Delete Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Verify Deletion ===" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$postId" -UseBasicParsing
    Write-Host "❌ Post still exists!"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Post successfully deleted (404 Not Found)!"
    }
}
