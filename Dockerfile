# Backend API (.NET 9) — Railway / Render / cualquier Docker
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src/backend
COPY backend/BarberiaAPI.csproj .
RUN dotnet restore BarberiaAPI.csproj
COPY backend/ .
RUN dotnet publish BarberiaAPI.csproj -c Release -o /app/out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
# Railway debe definir ASPNETCORE_URLS=http://0.0.0.0:$PORT (ver README).
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "BarberiaAPI.dll"]
