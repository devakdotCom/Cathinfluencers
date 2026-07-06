// Comprehensive listing of Parishes & Shrines categorized by Deaneries
// for Archdiocese of Madras-Mylapore and other partner dioceses in Tamil Nadu.

export interface ParishInfo {
  name: string;
  deanery?: string;
  location?: string;
}

export interface DioceseData {
  dioceseName: string;
  parishes: ParishInfo[];
}

export const ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES: ParishInfo[] = [
  // Deanery of St. Thomas, the Apostle
  { name: "Our Lady of Visitation Church", location: "Abiramapuram", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "Our Lady of Light Shrine", location: "Mylapore", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "St. Louis Church", location: "Adyar", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "Our Lady of Guidance Church", location: "Raja Annamalaipuram", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "Annai Velankanni Shrine", location: "Besant Nagar", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "National Shrine of St Thomas Basilica", location: "Santhome", deanery: "Deanery of St. Thomas, the Apostle" },
  { name: "Presentation of Our Lord Church", location: "Royapettah", deanery: "Deanery of St. Thomas, the Apostle" },

  // Deanery of St. John the Baptist
  { name: "St Luke’s Church", location: "Anna Nagar West", deanery: "Deanery of St. John the Baptist" },
  { name: "St Anthony’s Church (Pilar Fathers)", location: "Maduravoyal", deanery: "Deanery of St. John the Baptist" },
  { name: "Infant Jesus Church", location: "Chinmaya Nagar", deanery: "Deanery of St. John the Baptist" },
  { name: "Divine Mercy Church (Paulines)", location: "Anna Nagar", deanery: "Deanery of St. John the Baptist" },
  { name: "Holy Trinity Church", location: "Golden George Nagar", deanery: "Deanery of St. John the Baptist" },
  { name: "St Antony’s Church", location: "Mogappair West", deanery: "Deanery of St. John the Baptist" },
  { name: "Votive Shrine of the Immaculate Heart of Mary", location: "Kilpauk", deanery: "Deanery of St. John the Baptist" },
  { name: "St Theresa’s Church", location: "Nungambakkam High Road", deanery: "Deanery of St. John the Baptist" },
  { name: "Fatima Church", location: "Kodambakkam", deanery: "Deanery of St. John the Baptist" },
  { name: "Church of St Joseph the Worker", location: "Susaipuram, Nungambakkam", deanery: "Deanery of St. John the Baptist" },
  { name: "Ascension Church", location: "Metha Nagar, Aminjikarai", deanery: "Deanery of St. John the Baptist" },

  // Deanery of the Sacred Heart of Jesus
  { name: "St Francis Xavier’s Shrine (Salesians)", location: "Broadway", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "Queenship of Mary Church", location: "Chintadripet", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "Sacred Heart Shrine", location: "Egmore", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "Assumption Church", location: "George Town", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Mary’s Co-Cathedral (Salesians)", location: "Armenian Street", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Antony’s Church", location: "Narasingapuram", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Antony’s Church", location: "Park Town", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Antony’s Church", location: "Pudupet", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Andrew’s Church", location: "Choolai", deanery: "Deanery of the Sacred Heart of Jesus" },
  { name: "St Joseph’s Church", location: "Vepery", deanery: "Deanery of the Sacred Heart of Jesus" },

  // Deanery of Our Lady of Lourdes
  { name: "Mary Help of Christians Church (Salesians)", location: "Pulianthope, Basin Bridge", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "St Joseph’s Church", location: "Erukkanchery", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Our Lady of Health Church", location: "Muthamizh Nagar", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Sagaya Matha Church", location: "Nammalwarpet", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Holy Family Church", location: "Moolakadai", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Our Lady of Lourdes Shrine (Salesians)", location: "Perambur", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "The Risen Christ Church", location: "Peravallur", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "St Antony’s Church", location: "Vyasarpadi", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "St Teresa’s Church", location: "Sembiam, Perambur", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Shrine of Our Lady of Health", location: "Sastri Nagar, Vyasarpadi", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "St Paul’s Church", location: "Pooniamman Medu", deanery: "Deanery of Our Lady of Lourdes" },
  { name: "Our Lady of Consolation Church (Salesians)", location: "Vyasarpadi", deanery: "Deanery of Our Lady of Lourdes" },

  // Deanery of St. Jude
  { name: "Our Lady of Angels Church", location: "Arambakkam", deanery: "Deanery of St. Jude" },
  { name: "Sacred Heart Church", location: "Gorymedu, Gummidipundi", deanery: "Deanery of St. Jude" },
  { name: "St Joseph’s Church", location: "Kaniambakkam", deanery: "Deanery of St. Jude" },
  { name: "Our Lady of Perpetual Help Church", location: "Minjur", deanery: "Deanery of St. Jude" },
  { name: "Church of Our Lady of Assumption", location: "Periyapalayam", deanery: "Deanery of St. Jude" },
  { name: "St James Church", location: "Ponneri", deanery: "Deanery of St. Jude" },
  { name: "Shrine of Our Lady of Glory", location: "Pulicat", deanery: "Deanery of St. Jude" },
  { name: "St Ignatius Church", location: "Roshanagaram", deanery: "Deanery of St. Jude" },
  { name: "Our Lady of Refuge Church", location: "Uttukottai", deanery: "Deanery of St. Jude" },

  // Deanery of Infant Jesus
  { name: "St Francis of Assisi Mission", location: "Madhavaram", deanery: "Deanery of Infant Jesus" },
  { name: "Arokia Mada Church", location: "Redhills", deanery: "Deanery of Infant Jesus" },
  { name: "Devamada Church", location: "Kodungaiyur", deanery: "Deanery of Infant Jesus" },
  { name: "St Sebastian’s Church (Franciscans)", location: "Madavaram", deanery: "Deanery of Infant Jesus" },
  { name: "Our Lady of Perpetual Help Church", location: "Periyathoppu, Manali", deanery: "Deanery of Infant Jesus" },
  { name: "Christ the King Church", location: "Gandhi Nagar", deanery: "Deanery of Infant Jesus" },
  { name: "Infant Jesus Shrine", location: "Manali", deanery: "Deanery of Infant Jesus" },
  { name: "Our Lady of Good Health Church", location: "Mathur, Manali", deanery: "Deanery of Infant Jesus" },
  { name: "St Antony’s Church", location: "Puzhal Camp", deanery: "Deanery of Infant Jesus" },
  { name: "St Mary Magdalene Church", location: "Red Hills", deanery: "Deanery of Infant Jesus" },
  { name: "Poondi Madha Church", location: "Milk Colony, Madhavaram", deanery: "Deanery of Infant Jesus" },

  // Deanery of St. John Mary Vianney
  { name: "St Joseph’s Church", location: "Gandhipet", deanery: "Deanery of St. John Mary Vianney" },
  { name: "St Mathew’s Mission", location: "Kadambathur", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Christ the King Church", location: "Kallambedu", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Sacred Heart Church", location: "Perambakkam", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Our Lady of Rosary Church", location: "MGR Nagar", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Our Lady of Good Health Church", location: "Pannu", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Immaculate Conception Church", location: "Irulancherry, Perambakkam", deanery: "Deanery of St. John Mary Vianney" },
  { name: "Mary Help of Christians Church", location: "Pinjivakkam Kandigai", deanery: "Deanery of St. John Mary Vianney" },
  { name: "St Francis de Sales Church", location: "J N Road, Thiruvallur", deanery: "Deanery of St. John Mary Vianney" },

  // Deanery of St. Alphonsa
  { name: "St Thomas Church", location: "Alphonsapuram", deanery: "Deanery of St. Alphonsa" },
  { name: "Jagan Madha Marial Aalayam", location: "Kanakammachatram", deanery: "Deanery of St. Alphonsa" },
  { name: "St Joseph’s Mission", location: "Pandravedu", deanery: "Deanery of St. Alphonsa" },
  { name: "Holy Spirit Church", location: "Dr Ambedkar Nagar, Thiruvalangadu", deanery: "Deanery of St. Alphonsa" },
  { name: "Fatima Mission", location: "Thozhudavur Village", deanery: "Deanery of St. Alphonsa" },
  { name: "Church of Christ the Emmanuel", location: "Tiruttani", deanery: "Deanery of St. Alphonsa" },
  { name: "Our Lady of Fatima Church", location: "Theckalur", deanery: "Deanery of St. Alphonsa" },

  // Deanery of St. Paul
  { name: "Church of Sts Joseph the Worker & Philip", location: "Ambattur OT", deanery: "Deanery of St. Paul" },
  { name: "Don Bosco Church (Salesians)", location: "Ayanavaram", deanery: "Deanery of St. Paul" },
  { name: "Christ the King Church", location: "GKM Colony", deanery: "Deanery of St. Paul" },
  { name: "Infant Jesus Church", location: "Central Avenue, Korattur", deanery: "Deanery of St. Paul" },
  { name: "Arokia Madha Alayam", location: "Lashmipuram, Near Retteri", deanery: "Deanery of St. Paul" },
  { name: "Sagaya Annai Aalayam", location: "Mannurpet", deanery: "Deanery of St. Paul" },
  { name: "St Thomas Malankara Syrian Catholic Church", location: "Maria Nagar, Padi", deanery: "Deanery of St. Paul" },
  { name: "Annai Velankanni Church", location: "SIDCO Nagar, Villivakkam", deanery: "Deanery of St. Paul" },
  { name: "Sacred Heart Church", location: "Srinivasa Nagar, Kolathur", deanery: "Deanery of St. Paul" },
  { name: "St Antony’s Church", location: "Athipet, Ambattur", deanery: "Deanery of St. Paul" },
  { name: "Infant Jesus Church", location: "Ambattur", deanery: "Deanery of St. Paul" },
  { name: "Church of the Holy Eucharist", location: "Thirumulaivoyal", deanery: "Deanery of St. Paul" },
  { name: "St John De Britto Church", location: "Villivakkam", deanery: "Deanery of St. Paul" },
  { name: "St Thomas Pastoral Centre", location: "Ayanavaram", deanery: "Deanery of St. Paul" },

  // Deanery of St. Antony
  { name: "St Mark’s Church", location: "Adambakkam", deanery: "Deanery of St. Antony" },
  { name: "St Mathias Church (Capuchins)", location: "Ashok Nagar", deanery: "Deanery of St. Antony" },
  { name: "Infant Jesus Church", location: "Labour Colony, Guindy", deanery: "Deanery of St. Antony" },
  { name: "Shrine of Our Lady of Health", location: "Little Mount", deanery: "Deanery of St. Antony" },
  { name: "St Anne’s Church", location: "Nesapakkam", deanery: "Deanery of St. Antony" },
  { name: "St Joseph’s Church", location: "Porur", deanery: "Deanery of St. Antony" },
  { name: "Holy Cross Church", location: "T Nagar", deanery: "Deanery of St. Antony" },
  { name: "St Antony’s Church", location: "Taramani", deanery: "Deanery of St. Antony" },
  { name: "Annai Velankanni Church", location: "Yogam Garden, Valasaravakkam", deanery: "Deanery of St. Antony" },
  { name: "Our Lady of Perpetual Help Church", location: "Velachery", deanery: "Deanery of St. Antony" },

  // Deanery of St. Theresa of Child Jesus
  { name: "Sagaya Madha Church", location: "Ennore Beach Road", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Joseph’s Church", location: "Ennore", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "Sacred Heart Church", location: "Ernavoor, Ennore", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Theresa’s Church", location: "Kasimode", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "All Saints Church", location: "Thiruvottiyur Terminus", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "Mater Dolorosa Church", location: "Arathoon Road, Royapuram", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Peter’s Church", location: "Royapuram", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Paul’s Church", location: "Kaladipet, Thiruvottiyur", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Joseph’s Church", location: "Korukkupet", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "Blessed Sacrament Church", location: "New Washermanpet", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St John the Apostle Church", location: "Tondiarpet", deanery: "Deanery of St. Theresa of Child Jesus" },
  { name: "St Roque’s Church", location: "Old Washermenpet", deanery: "Deanery of St. Theresa of Child Jesus" },

  // Deanery of St. Francis Xavier
  { name: "St Joseph’s Church", location: "Pattabiram", deanery: "Deanery of St. Francis Xavier" },
  { name: "Annai Velankanni Church", location: "Railway Quarters", deanery: "Deanery of St. Francis Xavier" },
  { name: "St Antony’s Shrine", location: "MTH Road, Avadi", deanery: "Deanery of St. Francis Xavier" },
  { name: "Sacred Heart Garrison Church", location: "Avadi", deanery: "Deanery of St. Francis Xavier" },
  { name: "Infant Jesus Church", location: "RCC PO, Avadi", deanery: "Deanery of St. Francis Xavier" },
  { name: "Church of Annunciation", location: "Avadi", deanery: "Deanery of St. Francis Xavier" },
  { name: "Good Shepherd Church (Claretians)", location: "Thiruninravur", deanery: "Deanery of St. Francis Xavier" },
  { name: "Our Lady of Good Health Church", location: "Tirur, Sevvapet", deanery: "Deanery of St. Francis Xavier" },
  { name: "Our Lady of Velankanni Church", location: "Melma Nagar, Poonamallee", deanery: "Deanery of St. Francis Xavier" },
  { name: "St Theresa of the Child Jesus Church", location: "Srinivasa Nagar, Kolathur", deanery: "Deanery of St. Francis Xavier" },
  { name: "Our Lady of Assumption Church", location: "Paruthipattu", deanery: "Deanery of St. Francis Xavier" },
  { name: "Annai Velankanni Church", location: "Pattabiram", deanery: "Deanery of St. Francis Xavier" },
  { name: "St Joseph’s Church", location: "Pazhanjur", deanery: "Deanery of St. Francis Xavier" },
  { name: "Amalorpava Madha Church", location: "Poompozhil Nagar, Avadi", deanery: "Deanery of St. Francis Xavier" },
  { name: "St John the Baptist Church (Oblates)", location: "Karayanchavadi, Poonamallee", deanery: "Deanery of St. Francis Xavier" },
  { name: "Infant Jesus Church", location: "Muthapudupet", deanery: "Deanery of St. Francis Xavier" }
];

export const DIOCESE_CHENGALPATTU_PARISHES: ParishInfo[] = [
  // A
  { name: "Our Lady of Good Health Church", location: "Acharapakkam", deanery: "A" },
  { name: "Mazhai Malai Madha Shrine", location: "Acharapakkam Shrine", deanery: "A" },
  { name: "St. Thomas Church", location: "Alandur", deanery: "A" },
  { name: "Sacred Heart Church", location: "Ammaiyappanallur", deanery: "A" },
  { name: "St. Mother Teresa Church", location: "Annai Theresa Nagar", deanery: "A" },
  { name: "St. Antony’s Church", location: "Athur", deanery: "A" },

  // B
  { name: "St. Joseph’s Church", location: "B. Pazhaveri", deanery: "B" },
  { name: "Bethany Chapel", location: "Bethany Home Chapel", deanery: "B" },

  // C
  { name: "St. Joseph’s Cathedral", location: "Chengalpattu (Cathedral Parish)", deanery: "C" },
  { name: "Our Lady of Mount Carmel Church", location: "Cheyyur", deanery: "C" },
  { name: "St. Michael’s Church", location: "Chromepet", deanery: "C" },
  { name: "St. John the Baptist Church", location: "Collectorate – Kancheepuram", deanery: "C" },
  { name: "Our Lady of Mount Carmel Church", location: "Covelong (Kovalam)", deanery: "C" },

  // E
  { name: "St. Francis Xavier Church", location: "Edayanchavadi", deanery: "E" },
  { name: "Sacred Heart Church", location: "Elliot Nagar", deanery: "E" },
  { name: "St. Antony’s Church", location: "Erikkarai", deanery: "E" },

  // G
  { name: "St. Joseph’s Church", location: "Guduvancherry", deanery: "G" },

  // I
  { name: "St. Sebastian’s Church", location: "Iyyappanthangal", deanery: "I" },

  // K
  { name: "Our Lady of Lourdes Church", location: "Kalamani", deanery: "K" },
  { name: "St. Antony’s Church", location: "Kancheepuram – St. Antony’s", deanery: "K" },
  { name: "St. John the Baptist Church", location: "Karayanchavadi", deanery: "K" },
  { name: "Christ the King Church", location: "Kattankulathur", deanery: "K" },
  { name: "St. Francis Xavier Church", location: "Kelambakkam", deanery: "K" },
  { name: "St. Antony’s Church", location: "Kovilambakkam", deanery: "K" },
  { name: "Our Lady of Lourdes Church", location: "Kundrathur", deanery: "K" },

  // M
  { name: "Sacred Heart Church", location: "Manambedu", deanery: "M" },
  { name: "Christ the King Church", location: "Maraimalai Nagar", deanery: "M" },
  { name: "Our Lady of Good Health Church", location: "Medavakkam", deanery: "M" },
  { name: "Sacred Heart Church", location: "Melmaruvathur", deanery: "M" },
  { name: "Our Lady of Perpetual Help Church", location: "Minjur", deanery: "M" },
  { name: "St. Antony’s Church", location: "Moolacheri", deanery: "M" },
  { name: "St. Joseph’s Church", location: "Mudichur", deanery: "M" },

  // N
  { name: "St. Joseph’s Church", location: "Nandambakkam", deanery: "N" },
  { name: "Sacred Heart Church", location: "Nellikuppam", deanery: "N" },
  { name: "Our Lady of Assumption Church", location: "Nemili", deanery: "N" },
  { name: "St. Antony’s Church", location: "New Colony", deanery: "N" },

  // O
  { name: "St. Anne’s Church", location: "Otteri", deanery: "O" },

  // P
  { name: "St. Michael’s Church", location: "Pallavaram", deanery: "P" },
  { name: "St. Antony’s Church", location: "Pallikaranai", deanery: "P" },
  { name: "St. James Church", location: "Ponneri", deanery: "P" },
  { name: "Our Lady of Velankanni Church", location: "Poonamallee", deanery: "P" },
  { name: "St. Antony’s Church", location: "Poonjeri", deanery: "P" },
  { name: "Sacred Heart Church", location: "Potheri", deanery: "P" },
  { name: "St. Joseph’s Church", location: "Porur", deanery: "P" },
  { name: "St. Antony’s Church", location: "Pudupakkam", deanery: "P" },
  { name: "St. Antony’s Church", location: "Puzhal Camp", deanery: "P" },

  // R
  { name: "St. Mary Magdalene Church", location: "Red Hills", deanery: "R" },

  // S
  { name: "Sacred Heart Church", location: "Sankarapuram", deanery: "S" },
  { name: "St. Antony’s Church", location: "Sengadu", deanery: "S" },
  { name: "St. Antony’s Church", location: "Sholinganallur", deanery: "S" },
  { name: "Our Lady of Good Health Church", location: "Sithalapakkam", deanery: "S" },
  { name: "National Shrine of St. Thomas", location: "St. Thomas Mount", deanery: "S" },

  // T
  { name: "Our Lady of Fatima Church", location: "Tambaram", deanery: "T" },
  { name: "St. Joseph’s Church", location: "Thirumazhisai", deanery: "T" },
  { name: "Our Lady of Lourdes Church", location: "Thiruneermalai", deanery: "T" },
  { name: "St. Antony’s Church", location: "Thiruporur", deanery: "T" },
  { name: "St. Antony’s Church", location: "Tirusulam", deanery: "T" },

  // U
  { name: "Sacred Heart Church", location: "Uthiramerur", deanery: "U" },

  // V
  { name: "Annai Velankanni Church", location: "Valasaravakkam", deanery: "V" },
  { name: "Christ the King Church", location: "Vallakottai", deanery: "V" },
  { name: "St. Antony’s Church", location: "Vannanthurai", deanery: "V" },
  { name: "Sacred Heart Church", location: "Vannivedu", deanery: "V" },
  { name: "St. Antony’s Church", location: "Vandavasi", deanery: "V" },
  { name: "St. Joseph’s Church", location: "Vengal", deanery: "V" },
  { name: "Our Lady of Good Health Church", location: "Vennangupattu", deanery: "V" },
  { name: "Sacred Heart Church", location: "Venkatapuram", deanery: "V" },
  { name: "St. Antony’s Church", location: "Vijayaraghavapuram", deanery: "V" },
  { name: "Divine Mercy Church", location: "Vishwas Nagar", deanery: "V" },

  // W – Z
  { name: "St. Antony’s Church", location: "Walajabad", deanery: "W – Z" },
  { name: "Our Lady of Perpetual Help Church", location: "Zamin Pallavaram", deanery: "W – Z" }
];

export const DIOCESE_TUTICORIN_PARISHES: ParishInfo[] = [
  { name: "Our Lady of Snows Cathedral", location: "Tuticorin Cathedral Parish" },
  { name: "St. Theresa’s Church", location: "Therespuram" },
  { name: "St. Antony’s Church", location: "Muttom" },
  { name: "Our Lady of Assumption Church", location: "Vembar" },
  { name: "Sacred Heart Church", location: "Kayalpattinam" },
  { name: "St. Thomas Church", location: "Punnakayal" },
  { name: "Holy Cross Church", location: "Manapad" },
  { name: "St. Joseph’s Church", location: "Periyathalai" },
  { name: "St. Michael’s Church", location: "Sathankulam" },
  { name: "Our Lady of Good Health Church", location: "Tiruchendur" },
  { name: "St. Antony’s Church", location: "Nazareth" },
  { name: "Sacred Heart Church", location: "Pudur" },
  { name: "St. Francis Xavier Church", location: "Sawyerpuram" },
  { name: "St. Sebastian’s Church", location: "Eral" },
  { name: "Holy Family Church", location: "Arumuganeri" },
  { name: "St. John the Baptist Church", location: "Megnanapuram" },
  { name: "St. Joseph’s Church", location: "Kovilpatti" }
];

export const DIOCESE_VELLORE_PARISHES: ParishInfo[] = [
  { name: "Cathedral of the Assumption", location: "Vellore Cathedral Parish" },
  { name: "Sacred Heart Church", location: "Arcot" },
  { name: "Sacred Heart Church", location: "Gudiyatham" },
  { name: "St. Antony’s Church", location: "Katpadi" },
  { name: "Our Lady of Lourdes Church", location: "Bagayam" },
  { name: "St. Joseph’s Church", location: "Anaicut" },
  { name: "Sacred Heart Church", location: "Ambur" },
  { name: "St. Antony’s Church", location: "Vaniyambadi" },
  { name: "Sacred Heart Church", location: "Jolarpet" },
  { name: "Our Lady of Good Health Church", location: "Pernambut" },
  { name: "St. Joseph’s Church", location: "Kaniyambadi" },
  { name: "St. Michael’s Church", location: "Thiruvalam" },
  { name: "St. Antony’s Church", location: "Melvisharam" },
  { name: "Our Lady of Lourdes Church", location: "Alangayam" },
  { name: "Sacred Heart Church", location: "Natrampalli" },
  { name: "St. Joseph’s Church", location: "Timiri" },
  { name: "St. Francis Xavier Church", location: "Walajapet" }
];

export const DIOCESE_SALEM_PARISHES: ParishInfo[] = [
  { name: "Infant Jesus Cathedral", location: "Salem Cathedral Parish" },
  { name: "St. Joseph’s Church", location: "Suramangalam" },
  { name: "Sacred Heart Church", location: "Gugai" },
  { name: "St. Antony’s Church", location: "Hasthampatti" },
  { name: "Our Lady of Lourdes Church", location: "Ammapet" },
  { name: "Sacred Heart Church", location: "Omalur" },
  { name: "St. Joseph’s Church", location: "Mecheri" },
  { name: "St. Antony’s Church", location: "Edappadi" },
  { name: "Sacred Heart Church", location: "Attur" },
  { name: "Our Lady of Good Health Church", location: "Gangavalli" },
  { name: "Our Lady of Lourdes Church", location: "Yercaud" },
  { name: "Sacred Heart Church", location: "Rasipuram" },
  { name: "St. Antony’s Church", location: "Taramangalam" },
  { name: "St. Joseph’s Church", location: "Konganapuram" },
  { name: "Christ the King Church", location: "Mettur Dam" },
  { name: "Our Lady of Perpetual Help Church", location: "Idappadi" }
];

export const DIOCESE_DHARMAPURI_PARISHES: ParishInfo[] = [
  { name: "Sacred Heart Cathedral", location: "Dharmapuri Cathedral Parish" },
  { name: "Sacred Heart Church", location: "Hosur" },
  { name: "Our Lady of Lourdes Church", location: "Rayakottai" },
  { name: "Our Lady of Mount Carmel Church", location: "Thenkanikottai" },
  { name: "Vinnarasi Madha (Queen of Heaven) Church", location: "Kandikuppam" },
  { name: "Sacred Heart Church", location: "Madagondapalli" },
  { name: "St. Antony’s Church", location: "Anchatram" },
  { name: "Sacred Heart Church", location: "Uthangarai" },
  { name: "Our Lady of Mount Carmel Church", location: "B. Pallipatti" },
  { name: "Christ the King Church", location: "Palacode" },
  { name: "St. Joseph’s Church", location: "Hanumanthapuram" },
  { name: "Our Lady of Good Health Church", location: "Kottapatti" },
  { name: "St. Antony’s Church", location: "Morappur" },
  { name: "St. Francis Xavier Church", location: "Pennagaram" },
  { name: "St. Joseph’s Church", location: "Karimangalam" },
  { name: "Sacred Heart Church", location: "Harur" },
  { name: "St. Sebastian’s Church", location: "Velampatti" }
];

export const DIOCESE_COIMBATORE_PARISHES: ParishInfo[] = [
  { name: "Christ the King Cathedral", location: "Coimbatore Cathedral Parish" },
  { name: "Our Lady of Fatima Church", location: "Gandhipuram" },
  { name: "St. Antony’s Shrine", location: "Puliakulam" },
  { name: "Sacred Heart Church", location: "Ukkadam" },
  { name: "St. Francis Xavier Church", location: "Ramanathapuram" },
  { name: "St. Antony’s Church", location: "Saibaba Colony" },
  { name: "Our Lady of Good Health Church", location: "Singanallur" },
  { name: "Sacred Heart Church", location: "Peelamedu" },
  { name: "St. Joseph’s Church", location: "Saravanampatti" },
  { name: "St. Francis Xavier Church", location: "Perur" },
  { name: "St. Mary’s Church", location: "Mettupalayam" },
  { name: "Sacred Heart Church", location: "Pollachi" },
  { name: "St. Joseph’s Church", location: "Udumalpet" },
  { name: "St. Michael’s Church", location: "Valparai" },
  { name: "St. Antony’s Church", location: "Anaimalai" },
  { name: "St. Sebastian’s Church", location: "Palladam" },
  { name: "St. Joseph’s Church", location: "Kangeyam" },
  { name: "St. Antony’s Church", location: "Avinashi" },
  { name: "Sacred Heart Church", location: "Tiruppur" },
  { name: "Our Lady of Lourdes Church", location: "Somanur" },
  { name: "St. Antony’s Church", location: "Sulur" }
];

export const DIOCESE_OOTY_PARISHES: ParishInfo[] = [
  { name: "St. Stephen’s Church", location: "Ootacamund Cathedral Parish" },
  { name: "St. Antony’s Church", location: "Coonoor" },
  { name: "Holy Family Church", location: "Kotagiri" },
  { name: "Our Lady of Lourdes Church", location: "Gudalur" },
  { name: "Sacred Heart Church", location: "Ketti" },
  { name: "Our Lady of Good Health Church", location: "Lovedale" },
  { name: "St. Patrick’s Church", location: "Wellington" },
  { name: "St. Joseph’s Church", location: "Naduvattam" },
  { name: "St. Mary Magdalene Church", location: "Masinagudi" },
  { name: "St. Michael’s Church", location: "Pandalur" },
  { name: "Sacred Heart Church", location: "Cherambadi" },
  { name: "St. Sebastian’s Church", location: "Devala" },
  { name: "Our Lady of Mount Carmel Church", location: "Thorapalli" }
];

export const DIOCESE_TRICHY_PARISHES: ParishInfo[] = [
  { name: "Our Lady of Lourdes Cathedral", location: "Tiruchirapalli Cathedral Parish" },
  { name: "St. Mary’s Church", location: "Woraiyur" },
  { name: "Christ the King Church", location: "Thillai Nagar" },
  { name: "Sacred Heart Church", location: "Cantonment" },
  { name: "St. Joseph’s Church", location: "K.K. Nagar" },
  { name: "St. Antony’s Church", location: "Golden Rock" },
  { name: "Holy Cross Church", location: "Ponmalai" },
  { name: "Our Lady of Good Health Church", location: "Srirangam" },
  { name: "St. Joseph’s Church", location: "Manapparai" },
  { name: "Sacred Heart Church", location: "Thuraiyur" },
  { name: "St. Antony’s Church", location: "Musiri" },
  { name: "St. Francis Xavier Church", location: "Lalgudi" },
  { name: "St. Michael’s Church", location: "Thuvarankurichi" },
  { name: "St. Sebastian’s Church", location: "Kallakudi" },
  { name: "Our Lady of Lourdes Church", location: "Vaiyampatti" },
  { name: "Sacred Heart Church", location: "Pullambadi" },
  { name: "Holy Redeemer Church", location: "Pettavaithalai" },
  { name: "Annai Velankanni Church", location: "Samayapuram" },
  { name: "St. Joseph’s Church", location: "Inamkulathur" },
  { name: "St. Mary’s Church", location: "Sirugambur" }
];

export const DIOCESE_THANJAVUR_PARISHES: ParishInfo[] = [
  { name: "Sacred Heart Cathedral", location: "Thanjavur Cathedral Parish" },
  { name: "Our Lady of Lourdes Church", location: "Kumbakonam" },
  { name: "St. Antony’s Church", location: "Papanasam" },
  { name: "St. Joseph’s Church", location: "Orathanadu" },
  { name: "Sacred Heart Church", location: "Pattukkottai" },
  { name: "St. Michael’s Church", location: "Peravurani" },
  { name: "St. Francis Xavier Church", location: "Sethubavachatram" },
  { name: "Holy Cross Church", location: "Ayyampettai" },
  { name: "St. Sebastian’s Church", location: "Budalur" },
  { name: "Our Lady of Good Health Church", location: "Thiruvaiyaru" },
  { name: "St. Mary’s Church", location: "Vallam" },
  { name: "St. Joseph’s Church", location: "Ammapettai" },
  { name: "St. Antony’s Church", location: "Madukkur" },
  { name: "Sacred Heart Church", location: "Madhukkur East" },
  { name: "Our Lady of Mount Carmel Church", location: "Kalyanapuram" },
  { name: "St. Paul’s Church", location: "Thiruvonam" },
  { name: "St. John the Baptist Church", location: "Soolamangalam" },
  { name: "St. Thomas Church", location: "Eachankottai" }
];

export const DIOCESE_DINDIGUL_PARISHES: ParishInfo[] = [
  { name: "St. Joseph’s Cathedral", location: "Dindigul Cathedral Parish" },
  { name: "Sacred Heart Church", location: "Palani" },
  { name: "St. Antony’s Church", location: "Oddanchatram" },
  { name: "St. Michael’s Church", location: "Nilakottai" },
  { name: "Our Lady of Lourdes Church", location: "Batlagundu" },
  { name: "St. Joseph’s Church", location: "Natham" },
  { name: "Sacred Heart Church", location: "Vedasandur" },
  { name: "St. Peter’s Church", location: "Kodaikanal" },
  { name: "Our Lady of Good Health Church", location: "Kodaikanal Road" },
  { name: "St. Sebastian’s Church", location: "Ayakkudi" },
  { name: "St. Francis Xavier Church", location: "Reddiyarchatram" },
  { name: "Holy Family Church", location: "Eriodu" },
  { name: "St. Antony’s Church", location: "Guziliamparai" },
  { name: "Sacred Heart Church", location: "Kannivadi" },
  { name: "St. Joseph’s Church", location: "Ayyalur" },
  { name: "Our Lady of Mount Carmel Church", location: "Thadicombu" },
  { name: "St. Mary Magdalene Church", location: "Pallapatti" }
];

export const DIOCESE_SIVAGANGAI_PARISHES: ParishInfo[] = [
  { name: "Sacred Heart Cathedral", location: "Sivagangai Cathedral Parish" },
  { name: "Our Lady of Lourdes Church", location: "Karaikudi" },
  { name: "St. Antony’s Church", location: "Devakottai" },
  { name: "St. Joseph’s Church", location: "Manamadurai" },
  { name: "Sacred Heart Church", location: "Thiruppathur" },
  { name: "St. Michael’s Church", location: "Kalaiyarkoil" },
  { name: "Our Lady of Good Health Church", location: "Ilayangudi" },
  { name: "St. Francis Xavier Church", location: "S. Pudur" },
  { name: "St. Sebastian’s Church", location: "Singampunari" },
  { name: "Holy Family Church", location: "Kallal" },
  { name: "St. Mary’s Church", location: "Kannangudi" },
  { name: "St. Peter’s Church", location: "Pillayarpatti" },
  { name: "Our Lady of Mount Carmel Church", location: "Nerkuppai" },
  { name: "St. Joseph’s Church", location: "V. Pudur" },
  { name: "Sacred Heart Church", location: "Ariyakudi" },
  { name: "St. Antony’s Church", location: "Sakkottai" }
];

export const DIOCESE_PALAYAMKOTTAI_PARISHES: ParishInfo[] = [
  { name: "Sacred Heart Cathedral", location: "Palayamkottai Cathedral Parish" },
  { name: "St. Xavier’s Church", location: "Tirunelveli Town" },
  { name: "St. Joseph’s Church", location: "Vannarpettai" },
  { name: "St. Antony’s Church", location: "Melapalayam" },
  { name: "Christ the King Church", location: "KTC Nagar" },
  { name: "Our Lady of Lourdes Church", location: "Thisayanvilai" },
  { name: "St. Michael’s Church", location: "Radhapuram" },
  { name: "Holy Trinity Church", location: "Vijayanarayanam" },
  { name: "Sacred Heart Church", location: "Ambasamudram" },
  { name: "St. Sebastian’s Church", location: "Papanasam (Tirunelveli)" },
  { name: "St. Francis Xavier Church", location: "Cheranmahadevi" },
  { name: "St. Mary’s Church", location: "Manur" },
  { name: "Our Lady of Good Health Church", location: "Moolakaraipatti" },
  { name: "St. Joseph’s Church", location: "Kalakad" },
  { name: "Holy Cross Church", location: "Nanguneri" },
  { name: "St. Antony’s Church", location: "Panagudi" },
  { name: "St. Peter’s Church", location: "Koodankulam" }
];

export const DIOCESE_KOTTAR_PARISHES: ParishInfo[] = [
  { name: "St. Francis Xavier Cathedral", location: "Kottar Cathedral Parish" },
  { name: "Sacred Heart Church", location: "Nagercoil" },
  { name: "St. Joseph’s Church", location: "Thuckalay" },
  { name: "St. Antony’s Church", location: "Colachel" },
  { name: "St. Sebastian’s Church", location: "Marthandam" },
  { name: "Holy Trinity Church", location: "Kuzhithurai" },
  { name: "Our Lady of Lourdes Church", location: "Karungal" },
  { name: "St. Michael’s Church", location: "Eraniel" },
  { name: "Sacred Heart Church", location: "Thengapattinam" },
  { name: "St. Peter’s Church", location: "Midalam" },
  { name: "Our Lady of Good Health Church", location: "Neerodi" },
  { name: "Holy Cross Church", location: "Muttom (Kanyakumari)" },
  { name: "St. Francis Xavier Church", location: "Manavalakurichi" },
  { name: "St. Thomas Church", location: "Puthenthurai" },
  { name: "St. Mary’s Church", location: "Rajakkamangalam" },
  { name: "St. Joseph’s Church", location: "Kurumbanai" },
  { name: "Our Lady of Mount Carmel Church", location: "Vaniyakudi" }
];

// Helper to get parishes for a specific diocese
export function getParishesByDiocese(dioceseName: string): ParishInfo[] {
  const normalized = dioceseName.toLowerCase().replace(/[\s\W]+/g, ' ');
  if (normalized.includes("madras") || normalized.includes("mylapore")) {
    return ARCHDIOCESE_MADRAS_MYLAPORE_PARISHES;
  }
  if (normalized.includes("chengalpattu")) {
    return DIOCESE_CHENGALPATTU_PARISHES;
  }
  if (normalized.includes("tuticorin") || normalized.includes("thoothukudi")) {
    return DIOCESE_TUTICORIN_PARISHES;
  }
  if (normalized.includes("vellore")) {
    return DIOCESE_VELLORE_PARISHES;
  }
  if (normalized.includes("salem")) {
    return DIOCESE_SALEM_PARISHES;
  }
  if (normalized.includes("dharmapuri")) {
    return DIOCESE_DHARMAPURI_PARISHES;
  }
  if (normalized.includes("coimbatore")) {
    return DIOCESE_COIMBATORE_PARISHES;
  }
  if (normalized.includes("ooty") || normalized.includes("ootacamund") || normalized.includes("nilgiris")) {
    return DIOCESE_OOTY_PARISHES;
  }
  if (normalized.includes("trichy") || normalized.includes("tiruchirapalli") || normalized.includes("tiruchirappalli")) {
    return DIOCESE_TRICHY_PARISHES;
  }
  if (normalized.includes("thanjavur")) {
    return DIOCESE_THANJAVUR_PARISHES;
  }
  if (normalized.includes("dindigul")) {
    return DIOCESE_DINDIGUL_PARISHES;
  }
  if (normalized.includes("sivagangai") || normalized.includes("sivaganga")) {
    return DIOCESE_SIVAGANGAI_PARISHES;
  }
  if (normalized.includes("palayamkottai")) {
    return DIOCESE_PALAYAMKOTTAI_PARISHES;
  }
  if (normalized.includes("kottar")) {
    return DIOCESE_KOTTAR_PARISHES;
  }
  return [];
}

export function getNormalizedDiocese(diocese: string): string {
  const normalized = (diocese || '').toLowerCase().trim().replace(/[\s\W]+/g, ' ');
  if (normalized.includes("madras") || normalized.includes("mylapore") || normalized.includes("maylapore") || normalized.includes("maylapor") || normalized.includes("mylapor") || normalized.includes("chennai")) {
    return "Archdiocese of Madras – Mylapore";
  }
  if (normalized.includes("chengalpattu")) {
    return "Diocese of Chengalpattu";
  }
  if (normalized.includes("tuticorin") || normalized.includes("thoothukudi")) {
    return "Diocese of Tuticorin";
  }
  if (normalized.includes("vellore")) {
    return "Diocese of Vellore";
  }
  if (normalized.includes("salem")) {
    return "Diocese of Salem";
  }
  if (normalized.includes("dharmapuri")) {
    return "Diocese of Dharmapuri";
  }
  if (normalized.includes("coimbatore")) {
    return "Diocese of Coimbatore";
  }
  if (normalized.includes("ooty") || normalized.includes("ootacamund") || normalized.includes("nilgiris")) {
    return "Diocese of Ootacamund (Ooty)";
  }
  if (normalized.includes("trichy") || normalized.includes("tiruchirapalli") || normalized.includes("tiruchirappalli")) {
    return "Diocese of Tiruchirapalli (Trichy)";
  }
  if (normalized.includes("thanjavur")) {
    return "Diocese of Thanjavur";
  }
  if (normalized.includes("dindigul")) {
    return "Diocese of Dindigul";
  }
  if (normalized.includes("sivagangai") || normalized.includes("sivaganga")) {
    return "Diocese of Sivagangai";
  }
  if (normalized.includes("palayamkottai")) {
    return "Diocese of Palayamkottai";
  }
  if (normalized.includes("kottar")) {
    return "Diocese of Kottar";
  }
  return diocese || "Other Dioceses";
}

export function getNormalizedParish(parish: string, diocese: string): string {
  const normDiocese = getNormalizedDiocese(diocese);
  const parishes = getParishesByDiocese(normDiocese);
  if (!parishes || parishes.length === 0) {
    return parish;
  }

  const rawParish = (parish || '').trim();
  if (!rawParish) return "";

  const cleanStr = (str: string) => {
    return str.toLowerCase()
      .replace(/['’‘.]/g, '')
      .replace(/[\s\W]+/g, ' ')
      .trim();
  };

  const cleanInput = cleanStr(rawParish);

  // 1. Exact Name & Location Match Check
  for (const p of parishes) {
    const pNameClean = cleanStr(p.name);
    const pLocClean = p.location ? cleanStr(p.location) : "";

    if (pNameClean && pLocClean) {
      if (cleanInput.includes(pNameClean) && cleanInput.includes(pLocClean)) {
        return p.location ? `${p.name} – ${p.location}` : p.name;
      }
    }
  }

  // 2. Formatted Name Check
  for (const p of parishes) {
    const formatted = p.location ? `${p.name} – ${p.location}` : p.name;
    if (cleanStr(formatted) === cleanInput) {
      return formatted;
    }
    const formattedHyphen = p.location ? `${p.name} - ${p.location}` : p.name;
    if (cleanStr(formattedHyphen) === cleanInput) {
      return formatted;
    }
  }

  // 3. Substring Church Name match where church name is unique enough
  for (const p of parishes) {
    const pNameClean = cleanStr(p.name);
    if (pNameClean.length > 8 && (cleanInput.includes(pNameClean) || pNameClean.includes(cleanInput))) {
      return p.location ? `${p.name} – ${p.location}` : p.name;
    }
  }

  // 4. Common base names with exact location match
  for (const p of parishes) {
    const pLocClean = p.location ? cleanStr(p.location) : "";
    if (pLocClean && cleanInput.includes(pLocClean)) {
      const docClean = cleanStr(p.name);
      const commonWords = ["joseph", "lourdes", "antony", "theresa", "mary", "vincent", "heart", "light", "visitation", "velankanni", "thomas", "basilica", "presentation", "shrine", "cathedral", "luke", "fatima", "andrew", "francis", "xavier", "sebastian", "blessed", "sacred", "guidance"];
      const hasOverlap = commonWords.some(word => docClean.includes(word) && cleanInput.includes(word));
      if (hasOverlap) {
        return p.location ? `${p.name} – ${p.location}` : p.name;
      }
    }
  }

  // 5. If we find at least the location in that diocese's list, map to it
  for (const p of parishes) {
    if (p.location) {
      const cleanLoc = cleanStr(p.location);
      if (cleanInput.includes(cleanLoc)) {
        return `${p.name} – ${p.location}`;
      }
    }
  }

  return rawParish;
}
