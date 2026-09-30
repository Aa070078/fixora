const u = (id: string, w = 900) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMG = {
  tpuCase: u("photo-1567581935884-3349723552ca"),
  screenProtector: u("photo-1511707171634-5f897ff02aa9"),
  wallCharger: u("photo-1773147030733-5c9cf351bc3d"),
  typeCCable: u("photo-1758578070291-0c22ff555df9"),
  carCharger: u("photo-1548345680-f5475ea5df84"),
  powerBank: u("photo-1583863788434-e58a36330cf0"),
  wirelessCharger: u("photo-1533228100845-08145b01de14"),
  earbuds: u("photo-1565405727287-b5abc42d3bae"),
  earbudsCase: u("photo-1505236273191-1dce886b01e9"),
  phoneStand: u("photo-1522444195799-478538b28823"),
  repairTech: u("photo-1550041473-d296a3a8a18a", 1200),
  brokenPhones: u("photo-1746005847012-d89286605db5", 1200),
  fixingPhone: u("photo-1539331586018-346b53b2aaa4", 1200),
} as const;