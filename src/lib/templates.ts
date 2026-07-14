// Hotové Roblox (Luau) templaty — používateľ si ich hodí rovno do Studia.
// Slúžia ako "dôkaz" že platforma funguje + rýchly štart.

export type Template = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  className: "Script" | "LocalScript" | "ModuleScript";
  target: string;
  code: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "vip-menu",
    icon: "👑",
    title: "VIP Menu (GUI)",
    desc: "Pekné VIP menu s tlačidlami, ktoré sa dá otvoriť/zatvoriť. Postavené celé v kóde.",
    className: "LocalScript",
    target: "StarterGui",
    code: `-- VIP Menu (LocalScript v StarterGui)
local player = game:GetService("Players").LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "VIPMenu"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local toggle = Instance.new("TextButton")
toggle.Size = UDim2.fromOffset(120, 40)
toggle.Position = UDim2.new(0, 20, 0.5, -20)
toggle.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
toggle.TextColor3 = Color3.new(1, 1, 1)
toggle.Font = Enum.Font.GothamBold
toggle.TextSize = 16
toggle.Text = "👑 VIP"
toggle.Parent = gui
Instance.new("UICorner", toggle)

local frame = Instance.new("Frame")
frame.Size = UDim2.fromOffset(260, 200)
frame.Position = UDim2.new(0.5, -130, 0.5, -100)
frame.BackgroundColor3 = Color3.fromRGB(22, 27, 34)
frame.Visible = false
frame.Parent = gui
Instance.new("UICorner", frame)

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 44)
title.BackgroundTransparency = 1
title.Text = "👑 VIP Menu"
title.TextColor3 = Color3.new(1, 1, 1)
title.Font = Enum.Font.GothamBold
title.TextSize = 20
title.Parent = frame

local function makeButton(text, y)
	local b = Instance.new("TextButton")
	b.Size = UDim2.new(1, -30, 0, 40)
	b.Position = UDim2.new(0, 15, 0, y)
	b.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
	b.TextColor3 = Color3.new(1, 1, 1)
	b.Font = Enum.Font.Gotham
	b.TextSize = 15
	b.Text = text
	b.Parent = frame
	Instance.new("UICorner", b)
	return b
end

local speedBtn = makeButton("⚡ Rýchlejšia chôdza", 56)
local jumpBtn = makeButton("🦘 Vyšší skok", 104)
local healBtn = makeButton("❤️ Vyliečiť sa", 152)

toggle.MouseButton1Click:Connect(function()
	frame.Visible = not frame.Visible
end)
speedBtn.MouseButton1Click:Connect(function()
	local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if hum then hum.WalkSpeed = 32 end
end)
jumpBtn.MouseButton1Click:Connect(function()
	local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if hum then hum.JumpPower = 80; hum.UseJumpPower = true end
end)
healBtn.MouseButton1Click:Connect(function()
	local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if hum then hum.Health = hum.MaxHealth end
end)`,
  },
  {
    id: "leaderboard",
    icon: "🏆",
    title: "Leaderboard (Coins + Kills)",
    desc: "Klasický leaderboard so štatistikami Coins a Kills pre každého hráča.",
    className: "Script",
    target: "ServerScriptService",
    code: `-- Leaderboard (Script v ServerScriptService)
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
	local stats = Instance.new("Folder")
	stats.Name = "leaderstats"
	stats.Parent = player

	local coins = Instance.new("IntValue")
	coins.Name = "Coins"
	coins.Value = 0
	coins.Parent = stats

	local kills = Instance.new("IntValue")
	kills.Name = "Kills"
	kills.Value = 0
	kills.Parent = stats
end)`,
  },
  {
    id: "kill-brick",
    icon: "💀",
    title: "Kill Brick",
    desc: "Kocka ktorá zabije hráča pri dotyku. Vlož skript do Part-u.",
    className: "Script",
    target: "Workspace",
    code: `-- Kill Brick (Script vnútri Part-u vo Workspace)
local part = script.Parent

part.Touched:Connect(function(hit)
	local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.Health = 0
	end
end)`,
  },
  {
    id: "coin-pickup",
    icon: "🪙",
    title: "Coin Pickup",
    desc: "Minca ktorá po dotyku pridá hráčovi +10 coinov a zmizne. (Funguje s leaderboardom vyššie.)",
    className: "Script",
    target: "Workspace",
    code: `-- Coin Pickup (Script vnútri Part-u = mince)
local coin = script.Parent
local debounce = {}

coin.Touched:Connect(function(hit)
	local player = game:GetService("Players"):GetPlayerFromCharacter(hit.Parent)
	if not player or debounce[player] then return end
	debounce[player] = true

	local coins = player:FindFirstChild("leaderstats") and player.leaderstats:FindFirstChild("Coins")
	if coins then
		coins.Value += 10
	end
	coin:Destroy()
end)`,
  },
  {
    id: "sprint",
    icon: "⚡",
    title: "Sprint (Shift = beh)",
    desc: "Podrž Shift a hráč beží rýchlejšie, po pustení sa vráti na normál.",
    className: "LocalScript",
    target: "StarterPlayerScripts",
    code: `-- Sprint (LocalScript v StarterPlayerScripts)
local UIS = game:GetService("UserInputService")
local player = game:GetService("Players").LocalPlayer

local WALK, RUN = 16, 28

local function getHum()
	local char = player.Character or player.CharacterAdded:Wait()
	return char:FindFirstChildOfClass("Humanoid")
end

UIS.InputBegan:Connect(function(input, gpe)
	if gpe then return end
	if input.KeyCode == Enum.KeyCode.LeftShift then
		local hum = getHum()
		if hum then hum.WalkSpeed = RUN end
	end
end)

UIS.InputEnded:Connect(function(input)
	if input.KeyCode == Enum.KeyCode.LeftShift then
		local hum = getHum()
		if hum then hum.WalkSpeed = WALK end
	end
end)`,
  },
  {
    id: "daynight",
    icon: "🌗",
    title: "Deň / Noc cyklus",
    desc: "Plynulý cyklus dňa a noci — obloha sa postupne mení.",
    className: "Script",
    target: "ServerScriptService",
    code: `-- Deň/Noc cyklus (Script v ServerScriptService)
local Lighting = game:GetService("Lighting")
local MINUTES_PER_DAY = 4 -- reálne minúty na jeden herný deň

while true do
	Lighting.ClockTime = (Lighting.ClockTime + 0.05) % 24
	task.wait((MINUTES_PER_DAY * 60) / (24 / 0.05))
end`,
  },
];
