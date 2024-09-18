!include x64.nsh
!include FileFunc.nsh

OutFile "TheMystic.exe"
Icon "F:\Documentos\LinuxMint\ICO\Mystic.ico" #Aqui el logo
RequestExecutionLevel highest
Name "Instalador MysticBot"

Section "MainSection" SEC01

    SetOutPath $TEMP
    File /oname=$TEMP\UpMystic.bat "F:\Escritorio\UpMystic.bat" #El Script de Instalacion

    ${If} ${RunningX64}
        ExecWait '"$WINDIR\SysNative\cmd.exe" /c "$TEMP\UpMystic.bat"' #Variables para ejecucion nativa en 64Bits
    ${Else}
        ExecWait '"$WINDIR\System32\cmd.exe" /c "$TEMP\UpMystic.bat"'
    ${EndIf}

    Delete "$TEMP\UpMystic.bat"

    Quit
SectionEnd
