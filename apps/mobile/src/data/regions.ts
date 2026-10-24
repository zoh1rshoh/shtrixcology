export interface Region {
  id: string;
  name: string;
  districts: string[];
}

export const REGIONS: Region[] = [
  {
    id: 'andijon',
    name: 'Andijon viloyati',
    districts: [
      'Andijon tumani', 'Asaka tumani', 'Baliqchi tumani', "Bo'ston tumani",
      'Buloqboshi tumani', 'Izboskan tumani', 'Jalaquduq tumani',
      'Marhamat tumani', "Oltinko'l tumani", 'Paxtaobod tumani',
      "Qo'rg'ontepa tumani", 'Shahrixon tumani', "Ulug'nor tumani",
      "Xo'jaobod tumani", 'Andijon shahri', 'Xonobod shahri',
    ],
  },
  {
    id: 'buxoro',
    name: 'Buxoro viloyati',
    districts: [
      'Buxoro tumani', 'Vobkent tumani', "G'ijduvon tumani", 'Jondor tumani',
      'Kogon tumani', "Qorako'l tumani", 'Qorovulbozor tumani', 'Olot tumani',
      'Peshku tumani', 'Romitan tumani', 'Shofirkon tumani',
      'Buxoro shahri', 'Kogon shahri',
    ],
  },
  {
    id: 'fargona',
    name: "Farg'ona viloyati",
    districts: [
      'Oltiariq tumani', "Bag'dod tumani", 'Beshariq tumani',
      'Buvayda tumani', "Dang'ara tumani", "Farg'ona tumani",
      'Furqat tumani', "Qo'shtepa tumani", 'Quva tumani',
      'Rishton tumani', "So'x tumani", 'Toshloq tumani',
      "O'zbekiston tumani", "Uchko'prik tumani", 'Yozyovon tumani',
      "Farg'ona shahri", "Qo'qon shahri", "Marg'ilon shahri",
      'Quvasoy shahri',
    ],
  },
  {
    id: 'jizzax',
    name: 'Jizzax viloyati',
    districts: [
      'Arnasoy tumani', 'Baxmal tumani', "Do'stlik tumani",
      'Forish tumani', "G'allaorol tumani", 'Jizzax tumani',
      "Mirzacho'l tumani", 'Paxtakor tumani', 'Yangiobod tumani',
      'Zafarobod tumani', 'Zarbdor tumani', 'Zomin tumani',
      'Jizzax shahri',
    ],
  },
  {
    id: 'namangan',
    name: 'Namangan viloyati',
    districts: [
      'Chortoq tumani', 'Chust tumani', 'Kosonsoy tumani',
      'Mingbuloq tumani', 'Namangan tumani', 'Norin tumani',
      'Pop tumani', "To'raqo'rg'on tumani", "Uchqo'rg'on tumani",
      'Uychi tumani', "Yangiqo'rg'on tumani", 'Namangan shahri',
    ],
  },
  {
    id: 'navoiy',
    name: 'Navoiy viloyati',
    districts: [
      'Konimex tumani', 'Karmana tumani', 'Qiziltepa tumani',
      'Xatirchi tumani', 'Navbahor tumani', 'Nurota tumani',
      'Tomdi tumani', 'Uchquduq tumani',
      'Navoiy shahri', 'Zarafshon shahri',
    ],
  },
  {
    id: 'qashqadaryo',
    name: 'Qashqadaryo viloyati',
    districts: [
      'Chiroqchi tumani', 'Dehqonobod tumani', "G'uzor tumani",
      'Kasbi tumani', 'Kitob tumani', 'Koson tumani',
      'Mirishkor tumani', 'Muborak tumani', 'Nishon tumani',
      'Qamashi tumani', 'Qarshi tumani', 'Shahrisabz tumani',
      "Yakkabog' tumani", "Ko'kdala tumani",
      'Qarshi shahri', 'Shahrisabz shahri',
    ],
  },
  {
    id: 'samarqand',
    name: 'Samarqand viloyati',
    districts: [
      "Bulung'ur tumani", 'Ishtixon tumani', 'Jomboy tumani',
      "Kattaqo'rg'on tumani", 'Narpay tumani', 'Nurobod tumani',
      'Oqdaryo tumani', 'Payariq tumani', "Pastdarg'om tumani",
      'Paxtachi tumani', 'Samarqand tumani', 'Toyloq tumani',
      'Urgut tumani', "Qo'shrabot tumani", 'Chelak tumani',
      'Samarqand shahri', "Kattaqo'rg'on shahri",
    ],
  },
  {
    id: 'sirdaryo',
    name: 'Sirdaryo viloyati',
    districts: [
      'Boyovut tumani', 'Guliston tumani', 'Mirzaobod tumani',
      'Oqoltin tumani', 'Sardoba tumani', 'Sayxunobod tumani',
      'Sirdaryo tumani', 'Xovos tumani',
      'Guliston shahri', 'Shirin shahri', 'Yangiyer shahri',
    ],
  },
  {
    id: 'surxondaryo',
    name: 'Surxondaryo viloyati',
    districts: [
      'Angor tumani', 'Bandixon tumani', 'Boysun tumani',
      'Denov tumani', "Jarqo'rg'on tumani", 'Qiziriq tumani',
      "Qumqo'rg'on tumani", 'Muzrabot tumani', 'Oltinsoy tumani',
      'Sariosiyo tumani', 'Termiz tumani', 'Uzun tumani',
      'Sherobod tumani', "Sho'rchi tumani", 'Termiz shahri',
    ],
  },
  {
    id: 'toshkent-viloyat',
    name: 'Toshkent viloyati',
    districts: [
      'Bekobod tumani', "Bo'stonliq tumani", "Bo'ka tumani",
      'Chinoz tumani', 'Ohangaron tumani', "Oqqo'rg'on tumani",
      'Parkent tumani', 'Piskent tumani', 'Qibray tumani',
      'Quyichirchiq tumani', "O'rtachirchiq tumani", "Yangiyo'l tumani",
      'Yuqorichirchiq tumani', 'Zangiota tumani', 'Toshkent tumani',
      'Nurafshon shahri', 'Angren shahri', 'Bekobod shahri',
      'Chirchiq shahri', 'Olmaliq shahri', 'Ohangaron shahri',
      "Yangiyo'l shahri",
    ],
  },
  {
    id: 'xorazm',
    name: 'Xorazm viloyati',
    districts: [
      "Bog'ot tumani", 'Gurlan tumani', "Qo'shko'pir tumani",
      'Urganch tumani', 'Xazorasp tumani', 'Xonqa tumani',
      'Xiva tumani', 'Shovot tumani', 'Yangiariq tumani',
      'Yangibozor tumani', "Tuproqqal'a tumani",
      'Urganch shahri', 'Xiva shahri',
    ],
  },
  {
    id: 'qoraqalpoq',
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      'Amudaryo tumani', 'Beruniy tumani', 'Chimboy tumani',
      "Ellikqal'a tumani", 'Kegeyli tumani', "Mo'ynoq tumani",
      'Nukus tumani', "Qanliko'l tumani", "Qo'ng'irot tumani",
      "Qorao'zak tumani", 'Shumanay tumani', "Taxtako'pir tumani",
      "To'rtko'l tumani", "Xo'jayli tumani", 'Taxiatosh tumani',
      "Bo'zatov tumani", 'Nukus shahri',
    ],
  },
  {
    id: 'toshkent-shahar',
    name: 'Toshkent shahri',
    districts: [
      'Bektemir tumani', 'Chilonzor tumani', 'Mirobod tumani',
      'Mirzo Ulug\'bek tumani', 'Olmazor tumani', 'Sergeli tumani',
      'Shayxontohur tumani', 'Uchtepa tumani', 'Yakkasaroy tumani',
      'Yangihayot tumani', 'Yashnobod tumani', 'Yunusobod tumani',
    ],
  },
];