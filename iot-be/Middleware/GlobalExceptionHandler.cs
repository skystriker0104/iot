using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace IotServer.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        int status;
        string title;

        if (ex is AppException app)
        {
            status = app.StatusCode;
            title = app.Message;
            logger.LogWarning("{Status} {Message}", status, title);
        }
        else
        {
            status = StatusCodes.Status500InternalServerError;
            title = "Lỗi hệ thống";
            logger.LogError(ex, "Unhandled exception");
        }

        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = title }, ct);
        return true;
    }
}
