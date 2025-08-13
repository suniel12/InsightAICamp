-- Test AppleScript for PowerPoint export
on run argv
    set pptPath to item 1 of argv
    set outputDir to item 2 of argv
    
    tell application "Microsoft PowerPoint"
        activate
        
        -- Open the presentation
        open POSIX file pptPath
        delay 2
        
        -- Use the File menu to export
        tell application "System Events"
            tell process "Microsoft PowerPoint"
                -- File menu > Export
                click menu item "Export..." of menu "File" of menu bar 1
                delay 1
                
                -- Select PNG format
                click pop up button 1 of sheet 1 of window 1
                click menu item "PNG" of menu 1 of pop up button 1 of sheet 1 of window 1
                delay 0.5
                
                -- Set output location
                keystroke "g" using {shift down, command down}
                delay 0.5
                keystroke outputDir
                delay 0.5
                keystroke return
                delay 1
                
                -- Click Export button
                click button "Export" of sheet 1 of window 1
                delay 3
            end tell
        end tell
        
        -- Close the presentation
        close active presentation saving no
    end tell
end run