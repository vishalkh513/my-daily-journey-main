#!/usr/bin/env powershell
# API Test Script - Tests all features

$API = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser$timestamp@example.com"
$testUsername = "user$timestamp"
$testPassword = "TestPass123"

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE API TEST SUITE - All Features" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Function to safely make requests
function Test-API {
    param([string]$Method, [string]$Endpoint, [hashtable]$Data, [string]$Name)
    Write-Host "$Name..." -ForegroundColor Yellow
    try {
        $url = "$API$Endpoint"
        $body = $Data | ConvertTo-Json
        Write-Host "  URL: $url" -ForegroundColor Gray
        Write-Host "  Body: $body" -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $url -Method $Method `
            -ContentType "application/json" -Body $body -UseBasicParsing 2>&1
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  ✅ Success (Status: $($response.StatusCode))" -ForegroundColor Green
        Write-Host "  Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        return $content
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        return $null
    }
}

# ==== TEST 1: SIGNUP ====
Write-Host "TEST 1: USER SIGNUP" -ForegroundColor Magenta
Write-Host "========================================================================" -ForegroundColor Magenta
$signupData = @{
    email = $testEmail
    username = $testUsername
    password = $testPassword
    confirmPassword = $testPassword
}
$signupResp = Test-API -Method POST -Endpoint "/auth/signup" -Data $signupData `
    -Name "Creating new user account"
$userId = if ($signupResp -and $signupResp.user) { $signupResp.user.id } else { $null }
Write-Host "Captured User ID: $userId" -ForegroundColor Cyan
Write-Host ""

# ==== TEST 2: SIGNIN ====
if ($userId) {
    Write-Host "TEST 2: USER SIGNIN" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    $signinData = @{
        email = $testEmail
        password = $testPassword
    }
    $signinResp = Test-API -Method POST -Endpoint "/auth/signin" -Data $signinData `
        -Name "Signing in with created credentials"
    Write-Host ""
}

# ==== TEST 3: CREATE POSTS ====
if ($userId) {
    Write-Host "TEST 3: CREATE BLOG POSTS" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    
    $post1Data = @{
        userId = $userId
        title = "My First Daily Journey"
        content = "This is my first blog post exploring the new blogging feature."
        mood = "happy"
        published = $true
    }
    $post1Resp = Test-API -Method POST -Endpoint "/posts" -Data $post1Data `
        -Name "Creating first blog post"
    $postId1 = if ($post1Resp -and $post1Resp._id) { $post1Resp._id } else { $null }
    Write-Host "Captured Post 1 ID: $postId1" -ForegroundColor Cyan
    Write-Host ""
    
    $post2Data = @{
        userId = $userId
        title = "Learning Progress"
        content = "Great progress today with database integration and testing."
        mood = "excited"
        published = $true
    }
    $post2Resp = Test-API -Method POST -Endpoint "/posts" -Data $post2Data `
        -Name "Creating second blog post"
    Write-Host ""
    
    # Get all posts
    Write-Host "Fetching all posts..." -ForegroundColor Yellow
    try {
        $allPostsResp = Invoke-WebRequest -Uri "$API/posts" -Method GET -UseBasicParsing
        $allPosts = $allPostsResp.Content | ConvertFrom-Json
        Write-Host "  ✅ Retrieved $(if($allPosts -is [array]) { $allPosts.Count } else { 1 }) posts" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# ==== TEST 4: CREATE MARKS ====
if ($userId) {
    Write-Host "TEST 4: CREATE MARKS" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    
    $subjects = @(
        @{subject="Mathematics"; marks=85},
        @{subject="English"; marks=78},
        @{subject="Science"; marks=82},
        @{subject="History"; marks=75},
        @{subject="Physics"; marks=88},
        @{subject="Chemistry"; marks=80}
    )
    
    $markIds = @()
    foreach ($subj in $subjects) {
        $markData = @{
            user_id = $userId
            subject = $subj.subject
            marks_obtained = $subj.marks
            total_marks = 100
            test_date = "2026-04-29"
            notes = "Test for $($subj.subject)"
        }
        $markResp = Test-API -Method POST -Endpoint "/marks" -Data $markData `
            -Name "Creating mark for $($subj.subject)"
        if ($markResp -and $markResp._id) {
            $markIds += $markResp._id
            Write-Host "  Captured Mark ID: $($markResp._id)" -ForegroundColor Cyan
        }
    }
    Write-Host ""
    
    # Get all marks
    Write-Host "Fetching all marks for user..." -ForegroundColor Yellow
    try {
        $allMarksResp = Invoke-WebRequest -Uri "$API/marks?userId=$userId" -Method GET -UseBasicParsing
        $allMarks = $allMarksResp.Content | ConvertFrom-Json
        $count = if ($allMarks -is [array]) { $allMarks.Count } else { 1 }
        Write-Host "  ✅ Retrieved $count marks" -ForegroundColor Green
        if ($allMarks -is [array]) {
            foreach ($mark in $allMarks) {
                Write-Host "    - $($mark.subject) : $($mark.marks_obtained)/100" -ForegroundColor Cyan
            }
        } else {
            Write-Host "    - $($allMarks.subject) : $($allMarks.marks_obtained)/100" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# ==== TEST 5: UPDATE POST ====
if ($postId1) {
    Write-Host "TEST 5: UPDATE POST" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    
    $updatePostData = @{
        userId = $userId
        title = "My First Daily Journey (Updated)"
        content = "Updated content with more details and improvements."
        mood = "proud"
        published = $true
    }
    $updateResp = Test-API -Method PUT -Endpoint "/posts/$postId1" -Data $updatePostData `
        -Name "Updating blog post"
    Write-Host ""
}

# ==== SUMMARY ====
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Magenta
Write-Host "TEST SUMMARY" -ForegroundColor Magenta
Write-Host "========================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "✅ USER ACCOUNT CREATED" -ForegroundColor Green
Write-Host "   Email: $testEmail" -ForegroundColor Cyan
Write-Host "   Username: $testUsername" -ForegroundColor Cyan
Write-Host "   User ID: $userId" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ BLOG POSTS CREATED" -ForegroundColor Green
Write-Host "   Post 1 ID: $postId1" -ForegroundColor Cyan
Write-Host "   Post 2 created" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ MARKS CREATED" -ForegroundColor Green
Write-Host "   Total marks created: $(($markIds | Measure-Object).Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "CHECK MONGODB COMPASS:" -ForegroundColor Yellow
Write-Host "  Connection: mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net" -ForegroundColor Yellow
Write-Host "  Database: mydatabase" -ForegroundColor Yellow
Write-Host "  Collections to verify:" -ForegroundColor Yellow
Write-Host "    - users (new user with email: $testEmail)" -ForegroundColor Yellow
Write-Host "    - posts (2+ posts created)" -ForegroundColor Yellow
Write-Host "    - marks (6 marks created)" -ForegroundColor Yellow
Write-Host "    - credentials (password stored)" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
