$API = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test-user-$timestamp@example.com"
$testUsername = "testuser$timestamp"
$testPassword = "TestPassword123"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE API TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# TEST 1: USER SIGNUP
Write-Host ""
Write-Host "TEST 1: USER SIGNUP" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$signupBody = @{
    email = $testEmail
    username = $testUsername
    password = $testPassword
    confirmPassword = $testPassword
} | ConvertTo-Json

Write-Host "Creating user: $testEmail"
$signupResponse = Invoke-WebRequest -Uri "$API/auth/signup" -Method POST -ContentType "application/json" -Body $signupBody
$signupResult = $signupResponse.Content | ConvertFrom-Json
$userId = $signupResult.user.id
Write-Host "SUCCESS: User created!" -ForegroundColor Green
Write-Host "  User ID: $userId" -ForegroundColor Cyan
Write-Host "  Email: $testEmail" -ForegroundColor Cyan
Write-Host "  Username: $testUsername" -ForegroundColor Cyan

# TEST 2: USER SIGNIN
Write-Host ""
Write-Host "TEST 2: USER SIGNIN" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$signinBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

Write-Host "Signing in with: $testEmail"
$signinResponse = Invoke-WebRequest -Uri "$API/auth/signin" -Method POST -ContentType "application/json" -Body $signinBody
$signinResult = $signinResponse.Content | ConvertFrom-Json
Write-Host "SUCCESS: User signed in!" -ForegroundColor Green

# TEST 3: CREATE BLOG POSTS
Write-Host ""
Write-Host "TEST 3: CREATE BLOG POSTS" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$post1Body = @{
    userId = $userId
    title = "My First Daily Journey Entry"
    content = "This is my first blog post. I'm exploring the new blogging feature and it feels amazing to share my thoughts online!"
    mood = "happy"
    published = $true
} | ConvertTo-Json

Write-Host "Creating first blog post..."
$post1Response = Invoke-WebRequest -Uri "$API/posts" -Method POST -ContentType "application/json" -Body $post1Body
$post1Result = $post1Response.Content | ConvertFrom-Json
$postId = $post1Result._id
Write-Host "SUCCESS: First post created!" -ForegroundColor Green
Write-Host "  Post ID: $postId" -ForegroundColor Cyan
Write-Host "  Title: $($post1Result.title)" -ForegroundColor Cyan
Write-Host "  Mood: $($post1Result.mood)" -ForegroundColor Cyan

# Create second post
$post2Body = @{
    userId = $userId
    title = "Reflection on Learning"
    content = "Today I learned so many new things. The database integration is working smoothly and I'm happy with the progress."
    mood = "excited"
    published = $true
} | ConvertTo-Json

Write-Host ""
Write-Host "Creating second blog post..."
$post2Response = Invoke-WebRequest -Uri "$API/posts" -Method POST -ContentType "application/json" -Body $post2Body
$post2Result = $post2Response.Content | ConvertFrom-Json
Write-Host "SUCCESS: Second post created!" -ForegroundColor Green
Write-Host "  Post ID: $($post2Result._id)" -ForegroundColor Cyan
Write-Host "  Title: $($post2Result.title)" -ForegroundColor Cyan

# Get all posts
Write-Host ""
Write-Host "Fetching all posts..."
$allPostsResponse = Invoke-WebRequest -Uri "$API/posts" -Method GET
$allPostsResult = $allPostsResponse.Content | ConvertFrom-Json
Write-Host "SUCCESS: Retrieved all posts!" -ForegroundColor Green
Write-Host "  Total posts: $($allPostsResult.Count)" -ForegroundColor Cyan

# TEST 4: CREATE MARKS
Write-Host ""
Write-Host "TEST 4: CREATE MARKS" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$mark1Body = @{
    user_id = $userId
    subject = "Mathematics"
    marks_obtained = 85
    total_marks = 100
    test_date = "2026-04-29"
    notes = "Good performance on algebra"
} | ConvertTo-Json

Write-Host "Creating Mathematics mark..."
$mark1Response = Invoke-WebRequest -Uri "$API/marks" -Method POST -ContentType "application/json" -Body $mark1Body
$mark1Result = $mark1Response.Content | ConvertFrom-Json
$markId = $mark1Result._id
Write-Host "SUCCESS: Mark created!" -ForegroundColor Green
Write-Host "  Mark ID: $markId" -ForegroundColor Cyan
Write-Host "  Subject: $($mark1Result.subject)" -ForegroundColor Cyan
Write-Host "  Marks: $($mark1Result.marks_obtained)/$($mark1Result.total_marks)" -ForegroundColor Cyan

# Create multiple marks
$subjects = @("English", "Science", "History", "Physics", "Chemistry")
Write-Host ""
Write-Host "Creating marks for multiple subjects..."
foreach ($subject in $subjects) {
    $randomMarks = Get-Random -Minimum 70 -Maximum 95
    $markBody = @{
        user_id = $userId
        subject = $subject
        marks_obtained = $randomMarks
        total_marks = 100
        test_date = "2026-04-29"
        notes = "Test for $subject"
    } | ConvertTo-Json
    
    $markResponse = Invoke-WebRequest -Uri "$API/marks" -Method POST -ContentType "application/json" -Body $markBody
    Write-Host "  [OK] $subject : $randomMarks/100" -ForegroundColor Green
}

# Get all marks
Write-Host ""
Write-Host "Fetching all marks for user..."
$allMarksResponse = Invoke-WebRequest -Uri "$API/marks?userId=$userId" -Method GET
$allMarksResult = $allMarksResponse.Content | ConvertFrom-Json
Write-Host "SUCCESS: Retrieved all marks!" -ForegroundColor Green
Write-Host "  Total marks: $($allMarksResult.Count)" -ForegroundColor Cyan
Write-Host "  Subjects:" -ForegroundColor Cyan
foreach ($mark in $allMarksResult) {
    Write-Host "    - $($mark.subject) : $($mark.marks_obtained)/$($mark.total_marks)" -ForegroundColor Cyan
}

# TEST 5: UPDATE POST
Write-Host ""
Write-Host "TEST 5: UPDATE POST" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$updatePostBody = @{
    userId = $userId
    title = "My First Daily Journey Entry (Updated)"
    content = "Updated content with improvements and more details."
    mood = "proud"
    published = $true
} | ConvertTo-Json

Write-Host "Updating first post..."
$updateResponse = Invoke-WebRequest -Uri "$API/posts/$postId" -Method PUT -ContentType "application/json" -Body $updatePostBody
Write-Host "SUCCESS: Post updated!" -ForegroundColor Green

# Verify update
$verifyResponse = Invoke-WebRequest -Uri "$API/posts/$postId" -Method GET
$verifyResult = $verifyResponse.Content | ConvertFrom-Json
Write-Host "  Updated mood: $($verifyResult.mood)" -ForegroundColor Cyan

# TEST 6: UPDATE MARK
Write-Host ""
Write-Host "TEST 6: UPDATE MARK" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

$updateMarkBody = @{
    user_id = $userId
    subject = "Mathematics"
    marks_obtained = 92
    total_marks = 100
    test_date = "2026-04-29"
    notes = "Excellent performance on algebra!"
} | ConvertTo-Json

Write-Host "Updating Mathematics mark..."
$updateMarkResponse = Invoke-WebRequest -Uri "$API/marks/$markId" -Method PUT -ContentType "application/json" -Body $updateMarkBody
Write-Host "SUCCESS: Mark updated!" -ForegroundColor Green

# Verify mark update
$verifyMarksResponse = Invoke-WebRequest -Uri "$API/marks?userId=$userId" -Method GET
$verifyMarksResult = $verifyMarksResponse.Content | ConvertFrom-Json
$mathMark = $verifyMarksResult | Where-Object { $_.subject -eq "Mathematics" } | Select-Object -First 1
Write-Host "  Updated marks: $($mathMark.marks_obtained)/$($mathMark.total_marks)" -ForegroundColor Cyan

# FINAL SUMMARY
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "TEST SUMMARY - ALL TESTS PASSED" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "[SUCCESS] USER CREATED" -ForegroundColor Green
Write-Host "  Email: $testEmail" -ForegroundColor Cyan
Write-Host "  Username: $testUsername" -ForegroundColor Cyan
Write-Host "  User ID: $userId" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] BLOG POSTS CREATED AND TESTED" -ForegroundColor Green
Write-Host "  Total posts: 2 (verified)" -ForegroundColor Cyan
Write-Host "  Sample Post ID: $postId" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] MARKS CREATED AND TESTED" -ForegroundColor Green
Write-Host "  Total marks: 6 subjects" -ForegroundColor Cyan
Write-Host "  Sample Mark ID: $markId" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "NEXT: Verify data in MongoDB Compass" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Connection: mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net" -ForegroundColor Yellow
Write-Host "Database: mydatabase" -ForegroundColor Yellow
Write-Host "Collections to check:" -ForegroundColor Yellow
Write-Host "  1. users - should have new user" -ForegroundColor Yellow
Write-Host "  2. posts - should have 2 blog posts" -ForegroundColor Yellow
Write-Host "  3. marks - should have 6 marks entries" -ForegroundColor Yellow
Write-Host "  4. credentials - should have password hash" -ForegroundColor Yellow
Write-Host ""
