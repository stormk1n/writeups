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
