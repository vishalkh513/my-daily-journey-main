$postId = "69f13b56028d87304e5ce77f"
Write-Host "Testing GET /api/posts/$postId"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts/$postId" -UseBasicParsing
    $post = $response.Content | ConvertFrom-Json
    Write-Host "✅ Success!"
    Write-Host "Title: $($post.title)"
    Write-Host "Mood: $($post.mood)"
    Write-Host "Author: $($post.author)"
} catch {
    Write-Host "❌ Error:"
    Write-Host $_.Exception.Message
}
