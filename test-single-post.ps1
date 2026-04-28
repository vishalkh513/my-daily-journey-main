try {
    $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/posts/69f139f8028d87304e5ce779' -UseBasicParsing
    Write-Host "Status: $($res.StatusCode)"
    Write-Host "Content:"
    $res.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)"
}

