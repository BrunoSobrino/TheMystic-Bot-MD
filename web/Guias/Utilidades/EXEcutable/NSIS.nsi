!include x64.nsh
!include FileFunc.nsh

OutFile "TheMystic.exe"
Icon "Mystic.ico" # El logo debe estar junto a este script al compilar
RequestExecutionLevel highest
Name "Instalador MysticBot"

Section "MainSection" SEC01

    SetOutPath $TEMP
    File /oname=$TEMP\UpMystic.bat "UpMystic.bat" # El script debe estar junto a este .nsi al compilar

    ${If} ${RunningX64}
        ExecWait '"$WINDIR\SysNative\cmd.exe" /c "$TEMP\UpMystic.bat"' #Variables para ejecucion nativa en 64Bits
    ${Else}
        ExecWait '"$WINDIR\System32\cmd.exe" /c "$TEMP\UpMystic.bat"'
    ${EndIf}

    Delete "$TEMP\UpMystic.bat"

    Quit
SectionEnd
