--[[
	XSkinny AI scripter — Roblox Studio plugin
	Generuje Luau skripty cez XSkinny AI a vloží ich rovno na správne miesto.

	INŠTALÁCIA:
	1) V Studiu otvor View → Explorer.
	2) Pravý klik na priečinok, kam chceš (napr. ServerScriptService)... NIE.
	   Namiesto toho: skopíruj tento súbor do svojho Roblox Plugins priečinka,
	   alebo v Studiu: pravý klik → "Save as Local Plugin".
	   (Presný návod je na webe: /plugin)
	3) API kľúč získaš na svojom účte: /ucet

	Backend: XSkinny AI (Railway).
]]

local API_URL = "https://ai-app-production-d99c.up.railway.app/api/plugin/generate"
local SETTING_KEY = "XSkinnyAI_ApiKey"

local HttpService = game:GetService("HttpService")
local ChangeHistoryService = game:GetService("ChangeHistoryService")

----------------------------------------------------------------------
-- Toolbar + widget
----------------------------------------------------------------------
local toolbar = plugin:CreateToolbar("XSkinny AI")
local button = toolbar:CreateButton(
	"XSkinny AI",
	"Otvoriť XSkinny AI scripter",
	"rbxassetid://0"
)
button.ClickableWhenViewportHidden = true

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false, -- initially enabled
	false,
	360,
	520,
	300,
	400
)
local widget = plugin:CreateDockWidgetPluginGui("XSkinnyAI", widgetInfo)
widget.Title = "XSkinny AI scripter"

----------------------------------------------------------------------
-- Pomocníci na UI
----------------------------------------------------------------------
local COL = {
	bg = Color3.fromRGB(13, 17, 23),
	elev = Color3.fromRGB(22, 27, 34),
	border = Color3.fromRGB(42, 52, 65),
	text = Color3.fromRGB(230, 237, 243),
	dim = Color3.fromRGB(139, 152, 165),
	accent = Color3.fromRGB(0, 162, 255),
	green = Color3.fromRGB(39, 201, 63),
	red = Color3.fromRGB(226, 35, 26),
}

local function corner(parent, r)
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, r or 8)
	c.Parent = parent
	return c
end

local function pad(parent, p)
	local u = Instance.new("UIPadding")
	u.PaddingLeft = UDim.new(0, p)
	u.PaddingRight = UDim.new(0, p)
	u.PaddingTop = UDim.new(0, p)
	u.PaddingBottom = UDim.new(0, p)
	u.Parent = parent
	return u
end

local root = Instance.new("Frame")
root.Size = UDim2.fromScale(1, 1)
root.BackgroundColor3 = COL.bg
root.BorderSizePixel = 0
root.Parent = widget

local layout = Instance.new("UIListLayout")
layout.FillDirection = Enum.FillDirection.Vertical
layout.SortOrder = Enum.SortOrder.LayoutOrder
layout.Padding = UDim.new(0, 8)
layout.Parent = root
pad(root, 10)

local order = 0
local function nextOrder()
	order += 1
	return order
end

----------------------------------------------------------------------
-- API kľúč (uložený v plugin settings)
----------------------------------------------------------------------
local apiKey = plugin:GetSetting(SETTING_KEY)

local keyBox = Instance.new("TextBox")
keyBox.Size = UDim2.new(1, 0, 0, 34)
keyBox.LayoutOrder = nextOrder()
keyBox.BackgroundColor3 = COL.elev
keyBox.TextColor3 = COL.text
keyBox.PlaceholderText = "Vlož svoj API kľúč (xsk_...) — nájdeš ho na /ucet"
keyBox.PlaceholderColor3 = COL.dim
keyBox.Text = apiKey or ""
keyBox.Font = Enum.Font.Code
keyBox.TextSize = 13
keyBox.TextXAlignment = Enum.TextXAlignment.Left
keyBox.ClearTextOnFocus = false
keyBox.BorderSizePixel = 0
keyBox.Parent = root
corner(keyBox)
local keyPad = Instance.new("UIPadding")
keyPad.PaddingLeft = UDim.new(0, 8)
keyPad.PaddingRight = UDim.new(0, 8)
keyPad.Parent = keyBox
keyBox.FocusLost:Connect(function()
	apiKey = keyBox.Text
	plugin:SetSetting(SETTING_KEY, apiKey)
end)

----------------------------------------------------------------------
-- Prompt
----------------------------------------------------------------------
local promptBox = Instance.new("TextBox")
promptBox.Size = UDim2.new(1, 0, 0, 80)
promptBox.LayoutOrder = nextOrder()
promptBox.BackgroundColor3 = COL.elev
promptBox.TextColor3 = COL.text
promptBox.PlaceholderText = "Napíš čo chceš vyskriptovať... napr. 'kill-brick ktorý zabije hráča'"
promptBox.PlaceholderColor3 = COL.dim
promptBox.Text = ""
promptBox.Font = Enum.Font.Gotham
promptBox.TextSize = 14
promptBox.TextWrapped = true
promptBox.MultiLine = true
promptBox.TextXAlignment = Enum.TextXAlignment.Left
promptBox.TextYAlignment = Enum.TextYAlignment.Top
promptBox.ClearTextOnFocus = false
promptBox.BorderSizePixel = 0
promptBox.Parent = root
corner(promptBox)
pad(promptBox, 8)

local genBtn = Instance.new("TextButton")
genBtn.Size = UDim2.new(1, 0, 0, 40)
genBtn.LayoutOrder = nextOrder()
genBtn.BackgroundColor3 = COL.accent
genBtn.TextColor3 = Color3.new(1, 1, 1)
genBtn.Text = "✦ Generovať skript"
genBtn.Font = Enum.Font.GothamBold
genBtn.TextSize = 15
genBtn.BorderSizePixel = 0
genBtn.Parent = root
corner(genBtn)

local status = Instance.new("TextLabel")
status.Size = UDim2.new(1, 0, 0, 18)
status.LayoutOrder = nextOrder()
status.BackgroundTransparency = 1
status.TextColor3 = COL.dim
status.Text = ""
status.Font = Enum.Font.Gotham
status.TextSize = 12
status.TextXAlignment = Enum.TextXAlignment.Left
status.Parent = root

----------------------------------------------------------------------
-- Výsledky (scrollujúci zoznam)
----------------------------------------------------------------------
local results = Instance.new("ScrollingFrame")
results.Size = UDim2.new(1, 0, 1, -190)
results.LayoutOrder = nextOrder()
results.BackgroundTransparency = 1
results.BorderSizePixel = 0
results.ScrollBarThickness = 6
results.CanvasSize = UDim2.new()
results.AutomaticCanvasSize = Enum.AutomaticSize.Y
results.Parent = root

local resLayout = Instance.new("UIListLayout")
resLayout.Padding = UDim.new(0, 8)
resLayout.SortOrder = Enum.SortOrder.LayoutOrder
resLayout.Parent = results

local function clearResults()
	for _, ch in ipairs(results:GetChildren()) do
		if not ch:IsA("UIListLayout") then
			ch:Destroy()
		end
	end
end

----------------------------------------------------------------------
-- Vkladanie skriptu do hry
----------------------------------------------------------------------
local function resolveTarget(target)
	if target == "StarterPlayerScripts" then
		local sp = game:GetService("StarterPlayer")
		return sp:FindFirstChild("StarterPlayerScripts") or sp
	elseif target == "StarterCharacterScripts" then
		local sp = game:GetService("StarterPlayer")
		return sp:FindFirstChild("StarterCharacterScripts") or sp
	end
	local ok, svc = pcall(function()
		return game:GetService(target)
	end)
	if ok and svc then
		return svc
	end
	return game:GetService("ServerScriptService")
end

local function insertScript(scriptData)
	local parent = resolveTarget(scriptData.target)
	local recording = ChangeHistoryService:TryBeginRecording("XSkinnyAI Insert " .. scriptData.name)

	local inst = Instance.new(scriptData.className)
	inst.Name = scriptData.name
	local ok = pcall(function()
		inst.Source = scriptData.source
	end)
	if not ok then
		-- fallback pre novšie Studio API
		pcall(function()
			game:GetService("ScriptEditorService"):UpdateSourceAsync(inst, function()
				return scriptData.source
			end)
		end)
	end
	inst.Parent = parent

	if recording then
		ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
	end

	-- vyber a otvor skript
	pcall(function()
		plugin:OpenScript(inst)
	end)
	return parent
end

----------------------------------------------------------------------
-- Vykreslenie výsledkov
----------------------------------------------------------------------
local function addExplanation(text)
	if not text or text == "" then return end
	local lbl = Instance.new("TextLabel")
	lbl.Size = UDim2.new(1, -6, 0, 0)
	lbl.AutomaticSize = Enum.AutomaticSize.Y
	lbl.BackgroundTransparency = 1
	lbl.TextColor3 = COL.text
	lbl.Text = text
	lbl.Font = Enum.Font.Gotham
	lbl.TextSize = 13
	lbl.TextWrapped = true
	lbl.TextXAlignment = Enum.TextXAlignment.Left
	lbl.LayoutOrder = 0
	lbl.Parent = results
end

local function addScriptCard(scriptData, idx)
	local card = Instance.new("Frame")
	card.Size = UDim2.new(1, -6, 0, 66)
	card.BackgroundColor3 = COL.elev
	card.BorderSizePixel = 0
	card.LayoutOrder = idx
	card.Parent = results
	corner(card)
	pad(card, 8)

	local info = Instance.new("TextLabel")
	info.Size = UDim2.new(1, 0, 0, 32)
	info.BackgroundTransparency = 1
	info.TextColor3 = COL.text
	info.Text = "📜 " .. scriptData.name .. "\n" .. scriptData.className .. " → " .. scriptData.target
	info.Font = Enum.Font.Gotham
	info.TextSize = 12
	info.TextXAlignment = Enum.TextXAlignment.Left
	info.TextYAlignment = Enum.TextYAlignment.Top
	info.Parent = card

	local insertBtn = Instance.new("TextButton")
	insertBtn.Size = UDim2.new(1, 0, 0, 24)
	insertBtn.Position = UDim2.new(0, 0, 1, -24)
	insertBtn.AnchorPoint = Vector2.new(0, 0)
	insertBtn.BackgroundColor3 = COL.green
	insertBtn.TextColor3 = Color3.new(1, 1, 1)
	insertBtn.Text = "＋ Vložiť do hry"
	insertBtn.Font = Enum.Font.GothamBold
	insertBtn.TextSize = 12
	insertBtn.BorderSizePixel = 0
	insertBtn.Parent = card
	corner(insertBtn, 6)

	insertBtn.MouseButton1Click:Connect(function()
		local parent = insertScript(scriptData)
		insertBtn.Text = "✓ Vložené do " .. parent.Name
		insertBtn.BackgroundColor3 = COL.border
	end)
end

----------------------------------------------------------------------
-- Generovanie
----------------------------------------------------------------------
local busy = false

local function generate()
	if busy then return end
	local promptText = promptBox.Text
	if #promptText < 3 then
		status.Text = "Napíš čo chceš vyskriptovať."
		status.TextColor3 = COL.red
		return
	end
	if not apiKey or #apiKey < 8 then
		status.Text = "Chýba API kľúč — vlož ho hore (získaš na /ucet)."
		status.TextColor3 = COL.red
		return
	end

	busy = true
	genBtn.Text = "Generujem..."
	genBtn.BackgroundColor3 = COL.border
	status.Text = "Posielam požiadavku..."
	status.TextColor3 = COL.dim
	clearResults()

	local ok, response = pcall(function()
		return HttpService:RequestAsync({
			Url = API_URL,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json",
				["Authorization"] = "Bearer " .. apiKey,
			},
			Body = HttpService:JSONEncode({ prompt = promptText }),
		})
	end)

	busy = false
	genBtn.Text = "✦ Generovať skript"
	genBtn.BackgroundColor3 = COL.accent

	if not ok then
		status.Text = "Chyba spojenia. Povoľ HTTP: Game Settings → Security → Allow HTTP Requests."
		status.TextColor3 = COL.red
		return
	end

	if not response.Success then
		local msg = "Chyba (" .. tostring(response.StatusCode) .. ")"
		local okDec, body = pcall(function()
			return HttpService:JSONDecode(response.Body)
		end)
		if okDec and body and body.error then
			msg = body.error
		end
		status.Text = msg
		status.TextColor3 = COL.red
		return
	end

	local okDec, data = pcall(function()
		return HttpService:JSONDecode(response.Body)
	end)
	if not okDec or not data then
		status.Text = "Nečitateľná odpoveď servera."
		status.TextColor3 = COL.red
		return
	end

	status.Text = "Hotovo! ⚡ Zostatok kreditov: " .. tostring(data.credits or "?")
	status.TextColor3 = COL.green

	addExplanation(data.explanation)
	if data.scripts then
		for i, s in ipairs(data.scripts) do
			addScriptCard(s, i)
		end
	end
	if not data.scripts or #data.scripts == 0 then
		addExplanation("(AI nevrátila žiadny skript — skús požiadavku sformulovať inak.)")
	end
end

genBtn.MouseButton1Click:Connect(generate)

----------------------------------------------------------------------
-- Prepínanie widgetu tlačidlom
----------------------------------------------------------------------
button.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
