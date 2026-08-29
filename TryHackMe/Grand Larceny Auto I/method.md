# Getting started
Download the thm task file and unzip it with;
```
unzip GrandLarcenyAuto-windows-1784400165101.zip
```
Feel free to have a try at the game with the help of wine (that is if using a linux machine)

Upon lunching the game, it starts with a "Godot" interface, indicating the game was built using the godot engine.

Having that information, we can download the godot reverse engineering tool for linux on github with
```
mkdir gdre \
wget https://github.com/GDRETools/gdsdecomp/releases/download/v2.6.4/GDRE_tools-v2.6.4-linux.zip -O ./gdre/gdre.zip \
cd ./gdre \
unzip gdre.zip
```
Read the tool documentation for more.

But we reverse the game with
```
mkdir ../glaRev \
./gdre_tool.x86_64 --headless --recover=../GrandLarcenyAuto-windows/GrandLarcenyAuto.pck --output=../glaRev \
cd ../glaRev
```
Now, in in the glaRev folder, we can find the games source code written in c#.

Reading through the scripts in the recovered code, we find

FILE: GameController.cs
```
THE VAULT SWINGS OPEN\n\nSix stars. All you had to ****>etc
```
Telling us something about six stars, but thats funny cause

FILE: WantedSystem.cs says
```
private const int MaxStars = 5;
public void EscalateHeat(int amount)
{
	int num = player.WantedStars + amount;
	if (num > 5)
	{
	     num = 5;
	}
	player.WantedStars = num; <-- Caping our stars to 5 no matter the cause, but why?
}
```
The max stars available is 5, but in

FILE: SafehouseVault.cs we find
```
public string TryOpen()
{
    if (player.WantedStars >= 6)
    {
        string text = default(string);
        byte[] array2 = default(byte[]);
        byte[] array = default(byte[]);
    }
    
    return global::_003CModule_003E._202D_206D_202E_202C_202D_206F_202B_202B_200F_206C_206E_206C_200C_200F_202C_206E_200E_202A_202B_206D_206C_200D_200C_206B_202B_200D_202C_206C_202C_206D_206C_200D_206B_206E_202B_202B_200F_206A_202B_206B_202E<string>(1754313321);
}
```
Trying to open the safe vault once our heat level reaches 6.
Now looking at

FILE: PlayerState.cs which we find
```
namespace GrandLarcenyAuto;
public class PlayerState
{
    public int WantedStars { get; set; }
}
```
The state of the player can also be set, sounds interesting, what if we can hijack it and set our value (6 or try 100 for da fun of it)

# Planning the hijack, gonna be a big heist

First, in order to hijack this at runtime, we need dotnet (specifically dotnet 8)

WHY?

FILE: GrandLarcenyAuto.csproj
```
<PropertyGroup>
  <AssemblyName>GrandLarcenyAuto</AssemblyName>
  <EnableDynamicLoading>True</EnableDynamicLoading>
  <Nullable>enable</Nullable>
  <TargetFramework>net80</TargetFramework>  ### THIS LINE IS THE GIVE AWAY
</PropertyGroup>
```
Use the apt repo to get the dotnet-sdk-8.0 with
```
sudo apt update && sudo apt install dotnet-sdk-8.0
```
But, if it didn't work for you like with me, then download it from 
```
https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-8.0.424-linux-x64-binaries-targz

### INSTALLATION ###
mkdir -p $HOME/dotnet && tar zxf dotnet-sdk-8.0.424-linux-x64.tar.gz -C $HOME/dotnet
export DOTNET_ROOT=$HOME/dotnet
export PATH=$PATH:$HOME/dotnet
```
Knowing that we can hijack the game, we create our own version of the vault decryption in c# using dotnet-sdk.

First, create a new net console to interact with the game using
```
dotnet new console -n <CNSL NAME eg DnGla> && cd DnGla
```
In it, we find 'DnGla.csproj' and 'Program.cs'.

Inside DnGla.csproj, add a local assembly reference pointing to the GrandLarcenyAuto.dll file, leaving the rest unmodified
```
<ItemGroup>
  <Reference Include="GrandLarcenyAuto">
    <HintPath>../GrandLarcenyAuto-windows/data_GrandLarcenyAuto_windows_x86_64/GrandLarcenyAuto.dll</HintPath>
  </Reference>
</ItemGroup>
```
Once done, we update progrma.cs with our actual hijack code (replace the code blocks in it with)
```
using System;
using GrandLarcenyAuto;

namespace DnGla
{
  class Program
  {
    static void Main(string[] args)
    {
     Console.WriteLine("Starting hiest");
     PlayerState player = new PlayerState();
     player.WantedStars = 6;
     
     Console.WriteLine("Stars set to six")
     SafehouseVault vault = new SafehouseVault(player);
     Console.WriteLine(vault.TryOpen())
     }
   }
}
```
With that, run
```
dotnet run
```

And thats all, you should have the flag printed out to the terminal.
