export type Kategoria =
  | 'Start' | 'Petycja' | 'Spotkanie' | 'Edukacja' | 'Pomiary' | 'Akcja' | 'Współpraca' | 'Media';

export interface Wydarzenie {
  rok: string;
  data: string;
  tytul: string;
  opis: string;
  kat: Kategoria;
  kamien?: boolean;
}

export const wydarzenia: Wydarzenie[] = [
  { rok: '2017', data: '10 stycznia 2017', tytul: 'Powstaje Mysłowicki Alarm Smogowy', opis: 'Grupa nieformalna mieszkańców niegodzących się na życie w smogu. Założyciele: Jerzy Bryk i Piotr Grabowski.', kat: 'Start', kamien: true },
  { rok: '2017', data: 'styczeń 2017', tytul: 'Mapa kominów', opis: 'Internetowa mapa, na której mieszkańcy oznaczają posesje emitujące dym — w kilka tygodni ponad 130 punktów.', kat: 'Akcja' },
  { rok: '2017', data: '16 listopada 2017', tytul: 'Tablice edukacyjne dla szkół', opis: 'Prezentacja w Urzędzie Miasta i przekazanie tablic jednostkom miejskim.', kat: 'Edukacja' },
  { rok: '2017', data: '23 listopada 2017', tytul: 'I Mysłowickie Rozmowy o Czystym Powietrzu', opis: 'Spotkanie z mieszkańcami i władzami miasta. Ruszają kontrole palenisk przez Straż Miejską.', kat: 'Spotkanie', kamien: true },
  { rok: '2018', data: '20 stycznia 2018', tytul: 'Lista postulatów', opis: 'Spisanie postulatów z pierwszego spotkania wraz z oceną ich realizacji.', kat: 'Petycja' },
  { rok: '2018', data: '4 grudnia 2018', tytul: 'Szczyt klimatyczny COP24', opis: 'Udział w światowym szczycie klimatycznym w Katowicach.', kat: 'Współpraca' },
  { rok: '2019', data: 'marzec 2019', tytul: 'Program edukacyjny w szkołach', opis: 'Materiały i zajęcia dla mysłowickich szkół; spotkania „Czyste Powietrze” w dzielnicach.', kat: 'Edukacja', kamien: true },
  { rok: '2019', data: '28 marca 2019', tytul: 'Petycja do Marszałka Województwa', opis: 'Wystąpienie w sprawie ochrony powietrza na poziomie wojewódzkim.', kat: 'Petycja' },
  { rok: '2019', data: 'październik–listopad 2019', tytul: 'Spotkania z radami dzielnic', opis: 'Wesoła, Morgi i spotkania zespołu ds. powietrza; rozmowy ze Strażą Miejską.', kat: 'Spotkanie' },
  { rok: '2020', data: 'styczeń 2020', tytul: 'Pyłomierz Airly na Janowie/Ćmoku', opis: 'Pierwszy z lokalnych czujników wspieranych przez mieszkańców i radę dzielnicy.', kat: 'Pomiary' },
  { rok: '2020', data: '2020', tytul: '3,2 mln zł na dopłaty', opis: 'Efekt petycji MAS: rekordowy budżet na wymianę źródeł ciepła pozwala zlikwidować ponad 400 palenisk.', kat: 'Petycja', kamien: true },
  { rok: '2020', data: '18 czerwca 2020', tytul: 'Petycja ws. skrócenia terminów', opis: 'Wniosek do Zarządu Województwa Śląskiego o przyspieszenie wymiany kotłów.', kat: 'Petycja' },
  { rok: '2021', data: '25 lutego 2021', tytul: 'Petycja i wystąpienie na sesji RM', opis: 'Jerzy Bryk zabiera głos na sesji Rady Miasta w ślad za złożoną petycją.', kat: 'Petycja' },
  { rok: '2021', data: 'lipiec 2021', tytul: 'Sieć pyłomierzy Airly', opis: 'Kolejne czujniki: SP nr 16 i OSP Kosztowy, później Urząd Miasta i biblioteka w Brzezince.', kat: 'Pomiary', kamien: true },
  { rok: '2021', data: '22 października 2021', tytul: 'Petycja: 6 mln zł na 2022', opis: 'Nacisk na utrzymanie wysokiego budżetu na dopłaty dla mieszkańców.', kat: 'Petycja' },
  { rok: '2022', data: '29 stycznia 2022', tytul: 'Smogowy dron nad Mysłowicami', opis: 'Nagłośnienie tematu kontroli palenisk z powietrza.', kat: 'Media' },
  { rok: '2022', data: '2022', tytul: 'Konsultacje PONE i POŚ', opis: 'Opiniowanie miejskich dokumentów: programu ograniczania niskiej emisji i ochrony środowiska.', kat: 'Petycja', kamien: true },
  { rok: '2022', data: '20 listopada 2022', tytul: 'Petycja ws. budżetu na kotły', opis: 'Wniosek o informację publiczną i petycja w sprawie finansowania wymiany kotłów.', kat: 'Petycja' },
  { rok: '2023', data: '27 marca 2023', tytul: 'Komisja gospodarki — PONE', opis: 'Udział w pracach komisji Rady Miasta nad realizacją programu wymiany kotłów.', kat: 'Spotkanie' },
  { rok: '2023', data: 'kwiecień 2023', tytul: 'Raport „Kominy w ogniu”', opis: 'Opracowanie podsumowujące skalę problemu spalania odpadów.', kat: 'Media' },
  { rok: '2024', data: '14 października 2024', tytul: 'Mniej kopciuchów: 617', opis: 'Liczba pozaklasowych kotłów spada z ok. 5–6 tys. (2018) do 617 (dane z informacji publicznej).', kat: 'Pomiary', kamien: true },
  { rok: '2025', data: '1 lutego 2025', tytul: 'Bilans ośmiu lat', opis: 'Obszerne podsumowanie działań antysmogowych: dane, kontrole, ocena działań władz miasta.', kat: 'Media', kamien: true },
  { rok: '2026', data: 'styczeń 2026', tytul: 'Silny epizod smogowy', opis: 'Przekroczenia norm w Mysłowicach; nagłośnienie problemu wyłączania pyłomierzy przez miasto.', kat: 'Media' },
  { rok: '2026', data: '15 kwietnia 2026', tytul: 'Konferencja o jakości powietrza', opis: 'Konferencja w ramach projektu Stop Smog — pokazała skalę problemu w mieście.', kat: 'Spotkanie', kamien: true },
  { rok: '2026', data: '2026', tytul: 'Nowa strona internetowa', opis: 'Uruchomienie domeny myslowicki-alarm-smogowy.pl i nowoczesnej strony ruchu.', kat: 'Start' },
];

export const kamienie = wydarzenia.filter((w) => w.kamien);
