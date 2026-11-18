-- LazyVim: in lua/config/keymaps.lua ergänzen.
-- Normales Neovim: aus init.lua laden oder dort ergänzen.
vim.keymap.set("n", "<leader>mp", function()
  local file = vim.api.nvim_buf_get_name(0)
  if vim.bo.buftype ~= "" or file == "" or vim.fn.filereadable(file) ~= 1 then
    vim.notify("MD Preview: Datei zuerst speichern.", vim.log.levels.WARN)
    return
  end
  if not file:lower():match("%.md$") and not file:lower():match("%.markdown$") and not file:lower():match("%.txt$") then
    vim.notify("MD Preview: Bitte eine Markdown- oder TXT-Datei öffnen.", vim.log.levels.WARN)
    return
  end
  vim.fn.jobstart({
    "/usr/bin/open", "-g", "-a",
    "/path/to/MD-Markdown-Preview/dist/MD Preview.app",
    "--", file,
  }, { detach = true })
end, { desc = "Markdown in MD Preview öffnen" })
