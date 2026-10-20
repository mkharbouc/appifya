# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
shopt -s expand_aliases
# Check for rg availability
if ! (unalias rg 2>/dev/null; command -v rg) >/dev/null 2>&1; then
  function rg {
  local _cc_bin="${CLAUDE_CODE_EXECPATH:-}"
  [[ -x $_cc_bin ]] || _cc_bin=$(command -v claude 2>/dev/null)
  if [[ ! -x $_cc_bin ]]; then command rg "$@"; return; fi
  if [[ -n $ZSH_VERSION ]]; then
    ARGV0=rg "$_cc_bin" "$@"
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    ARGV0=rg "$_cc_bin" "$@"
  elif [[ $BASHPID != $$ ]]; then
    exec -a rg "$_cc_bin" "$@"
  else
    (exec -a rg "$_cc_bin" "$@")
  fi
}
fi
export PATH='/c/Users/kharb/bin:/ucrt64/bin:/usr/local/bin:/usr/bin:/bin:/ucrt64/bin:/usr/bin:/c/Users/kharb/bin:/c/Users/kharb/AppData/Roaming/Code/User/globalStorage/github.copilot-chat/debugCommand:/c/Users/kharb/AppData/Roaming/Code/User/globalStorage/github.copilot-chat/copilotCli:/c/WINDOWS/system32:/c/WINDOWS:/c/WINDOWS/System32/Wbem:/c/WINDOWS/System32/WindowsPowerShell/v1.0:/c/WINDOWS/System32/OpenSSH:/c/Users/kharb/.local/bin:/c/Program Files/nodejs:/cmd:/c/Users/kharb/.local/bin:/c/Users/kharb/AppData/Local/Microsoft/WindowsApps:/c/Users/kharb/AppData/Local/Programs/Ollama:/c/Users/kharb/AppData/Roaming/npm:/c/Users/kharb/AppData/Local/Programs/Microsoft VS Code/bin:/c/Users/kharb/AppData/Local/Microsoft/WinGet/Links:/c/Users/kharb/.vscode/extensions/ms-python.debugpy-2026.6.0-win32-x64/bundled/scripts/noConfigScripts:/usr/bin/vendor_perl:/usr/bin/core_perl'
