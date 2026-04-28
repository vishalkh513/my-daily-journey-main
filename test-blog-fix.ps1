# Test Blog CRUD Operations
$BASE_URL = "http://localhost:3000"
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$TEST_EMAIL = "testblog-$TIMESTAMP@example.com"

Write-Host "🧪 Testing Blog Operations..." -ForegroundColor Cyan
Write-Host "Using email: $TEST_EMAIL" -ForegroundColor Gray
Write-Host ""

# 1. Create a test user
Write-Host "1️⃣  Creating test user..." -ForegroundColor Yellow
$signupBody = @{
    email = $TEST_EMAIL
    username = "testblog-$TIMESTAMP"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

$signupResponse = Invoke-WebRequest -Uri "$BASE_URL/api/auth/signup" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $signupBody `
    -UseBasicParsing

$signupData = $signupResponse.Content | ConvertFrom-Json
$userId = $signupData.user.id

if ($signupData.success) {
    Write-Host "✅ User created: $userId" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create user" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Create a blog post
Write-Host "2️⃣  Creating blog post..." -ForegroundColor Yellow
$postBody = @{
    userId = $userId
    title = "My First Blog Entry"
    content = "This is my first blog post. Testing the create functionality."
    mood = "excited"
} | ConvertTo-Json

$postResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $postBody `
    -UseBasicParsing

$postData = $postResponse.Content | ConvertFrom-Json
$postId = $postData._id

if ($postResponse.StatusCode -eq 201) {
    Write-Host "✅ Post created: $postId" -ForegroundColor Green
    Write-Host "   Title: $($postData.title)" -ForegroundColor Green
    Write-Host "   Mood: $($postData.mood)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create post" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Get single post by ID
Write-Host "3️⃣  Fetching single post..." -ForegroundColor Yellow
$getResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts/$postId" `
    -Method GET `
    -UseBasicParsing

$getData = $getResponse.Content | ConvertFrom-Json

if ($getResponse.StatusCode -eq 200) {
    Write-Host "✅ Post fetched successfully" -ForegroundColor Green
    Write-Host "   Title: $($getData.title)" -ForegroundColor Green
    Write-Host "   Content: $($getData.content.Substring(0, [Math]::Min(50, $getData.content.Length)))..." -ForegroundColor Green
    Write-Host "   Mood: $($getData.mood)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to fetch post" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Update blog post
Write-Host "4️⃣  Updating blog post..." -ForegroundColor Yellow
$updateBody = @{
    userId = $userId
    title = "My First Blog Entry - UPDATED"
    content = "This is my first blog post. Testing the UPDATE functionality - now with modifications!"
    mood = "reflective"
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts/$postId" `
    -Method PUT `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $updateBody `
    -UseBasicParsing

$updateData = $updateResponse.Content | ConvertFrom-Json

if ($updateResponse.StatusCode -eq 200) {
    Write-Host "✅ Post updated successfully" -ForegroundColor Green
    Write-Host "   New Title: $($updateData.title)" -ForegroundColor Green
    Write-Host "   New Mood: $($updateData.mood)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update post" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Verify update by fetching again
Write-Host "5️⃣  Verifying update..." -ForegroundColor Yellow
$verifyResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts/$postId" `
    -Method GET `
    -UseBasicParsing

$verifyData = $verifyResponse.Content | ConvertFrom-Json

if ($verifyData.title -like "*UPDATED*" -and $verifyData.mood -eq "reflective") {
    Write-Host "✅ Post update verified" -ForegroundColor Green
    Write-Host "   Title: $($verifyData.title)" -ForegroundColor Green
    Write-Host "   Mood: $($verifyData.mood)" -ForegroundColor Green
} else {
    Write-Host "❌ Update not reflected in database" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 6. Get all posts
Write-Host "6️⃣  Fetching all posts..." -ForegroundColor Yellow
$allResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts" `
    -Method GET `
    -UseBasicParsing

$allData = $allResponse.Content | ConvertFrom-Json

if ($allData.Count -gt 0) {
    Write-Host "✅ Found $($allData.Count) posts" -ForegroundColor Green
} else {
    Write-Host "⚠️  No posts found" -ForegroundColor Yellow
}

Write-Host ""

# 7. Delete blog post
Write-Host "7️⃣  Deleting blog post..." -ForegroundColor Yellow
$deleteResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts/$postId`?userId=$userId" `
    -Method DELETE `
    -UseBasicParsing

$deleteData = $deleteResponse.Content | ConvertFrom-Json

if ($deleteResponse.StatusCode -eq 200 -and $deleteData.success) {
    Write-Host "✅ Post deleted successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to delete post" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 8. Verify deletion
Write-Host "8️⃣  Verifying deletion..." -ForegroundColor Yellow
try {
    $verifyDeleteResponse = Invoke-WebRequest -Uri "$BASE_URL/api/posts/$postId" `
        -Method GET `
        -UseBasicParsing
    
    Write-Host "❌ Post still exists after deletion" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Host "✅ Post successfully deleted (404 Not Found)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ All blog operations working correctly!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
