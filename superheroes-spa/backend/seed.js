const mongoose = require('mongoose');
require('dotenv').config();
const Hero = require('./src/models/Hero');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superheroesdb';

const getAvatar = (name, house, idx) => {
  const bg = house === 'Marvel' ? 'ed1d24' : '0476F2';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=200&bold=true&font-size=0.4&unique=img${idx}`;
};

const heroesData = [
  // Marvel
  { name: 'Spider-Man', realName: 'Peter Parker', year: 1962, house: 'Marvel', biography: 'Al ser mordido por una araña radiactiva, Peter Parker obtuvo habilidades arácnidas.', equipment: 'Lanzatelarañas, Traje de Spider-Man', images: [getAvatar('Spider-Man', 'Marvel', 1), getAvatar('Spider-Man', 'Marvel', 2)] },
  { name: 'Iron Man', realName: 'Tony Stark', year: 1963, house: 'Marvel', biography: 'Genio inventor que construyó una armadura de alta tecnología para combatir el mal.', equipment: 'Armadura motorizada, Reactor Arc', images: [getAvatar('Iron Man', 'Marvel', 1)] },
  { name: 'Thor', realName: 'Thor Odinson', year: 1962, house: 'Marvel', biography: 'El Dios nórdico del Trueno y miembro fundador de los Vengadores.', equipment: 'Mjolnir', images: [getAvatar('Thor', 'Marvel', 1), getAvatar('Thor', 'Marvel', 2)] },
  { name: 'Captain America', realName: 'Steve Rogers', year: 1941, house: 'Marvel', biography: 'Un joven frágil mejorado hasta la cima de la perfección humana por un suero experimental.', equipment: 'Escudo de Vibranium', images: [getAvatar('Captain America', 'Marvel', 1)] },
  { name: 'Black Widow', realName: 'Natasha Romanoff', year: 1964, house: 'Marvel', biography: 'Espía y asesina altamente entrenada y miembro fundador de los Vengadores.', equipment: 'Brazaletes, Armas de fuego', images: [getAvatar('Black Widow', 'Marvel', 1)] },
  { name: 'Hulk', realName: 'Bruce Banner', year: 1962, house: 'Marvel', biography: 'Un científico brillante que se transforma en un monstruo gigante y enfurecido cuando se estresa.', equipment: 'Ninguno', images: [getAvatar('Hulk', 'Marvel', 1), getAvatar('Hulk', 'Marvel', 2)] },
  { name: 'Wolverine', realName: 'Logan', year: 1974, house: 'Marvel', biography: 'Un mutante con proceso de envejecimiento lento, sentidos afilados y gran factor de curación.', equipment: 'Garras de Adamantium', images: [getAvatar('Wolverine', 'Marvel', 1)] },
  { name: 'Doctor Strange', realName: 'Stephen Strange', year: 1963, house: 'Marvel', biography: 'Un neurocirujano brillante pero arrogante que se convierte en el Hechicero Supremo.', equipment: 'Capa de Levitación, Ojo de Agamotto', images: [getAvatar('Doctor Strange', 'Marvel', 1)] },
  { name: 'Black Panther', realName: 'T\'Challa', year: 1966, house: 'Marvel', biography: 'El rey de la nación africana secreta y altamente avanzada de Wakanda.', equipment: 'Traje de Vibranium', images: [getAvatar('Black Panther', 'Marvel', 1)] },
  { name: 'Scarlet Witch', realName: 'Wanda Maximoff', year: 1964, house: 'Marvel', biography: 'Una mutante con la capacidad de alterar la realidad y la magia del caos.', equipment: 'Ninguno', images: [getAvatar('Scarlet Witch', 'Marvel', 1)] },
  { name: 'Deadpool', realName: 'Wade Wilson', year: 1991, house: 'Marvel', biography: 'Un mercenario con un factor de curación sobrehumano y mucha tendencia a romper la cuarta pared.', equipment: 'Katanas, Armas de fuego', images: [getAvatar('Deadpool', 'Marvel', 1), getAvatar('Deadpool', 'Marvel', 2)] },
  { name: 'Thanos', realName: 'Thanos', year: 1973, house: 'Marvel', biography: 'Un señor de la guerra de Titán que busca las Piedras del Infinito para equilibrar el universo.', equipment: 'Guantelete del Infinito', images: [getAvatar('Thanos', 'Marvel', 1)] },
  { name: 'Loki', realName: 'Loki Laufeyson', year: 1962, house: 'Marvel', biography: 'El hermano adoptivo de Thor y el Dios nórdico de los Engaños y las Mentiras.', equipment: 'Cetro Chitauri, Dagas', images: [getAvatar('Loki', 'Marvel', 1)] },
  { name: 'Magneto', realName: 'Max Eisenhardt', year: 1963, house: 'Marvel', biography: 'Un poderoso mutante con la capacidad de generar y controlar campos magnéticos de todo tipo.', equipment: 'Casco Protector', images: [getAvatar('Magneto', 'Marvel', 1)] },
  { name: 'Venom', realName: 'Eddie Brock', year: 1988, house: 'Marvel', biography: 'Un simbionte alienígena unido a Eddie Brock, que con frecuencia sirve como antihéroe vengativo.', equipment: 'Traje Simbionte', images: [getAvatar('Venom', 'Marvel', 1)] },
  { name: 'Captain Marvel', realName: 'Carol Danvers', year: 1968, house: 'Marvel', biography: 'Piloto que obtuvo poderes cósmicos inmensurables tras exponerse a la energía del Teseracto.', equipment: 'Uniforme Kree', images: [getAvatar('Captain Marvel', 'Marvel', 1)] },
  { name: 'Hawkeye', realName: 'Clint Barton', year: 1964, house: 'Marvel', biography: 'Un maestro tirador altamente experimentado en múltiples artes marciales y armamento de precisión.', equipment: 'Arco y Flechas Especiales', images: [getAvatar('Hawkeye', 'Marvel', 1)] },
  { name: 'Ant-Man', realName: 'Scott Lang', year: 1979, house: 'Marvel', biography: 'Ladrón reformado que usa un traje con Partículas Pym para encogerse y aumentar su fuerza.', equipment: 'Traje de Ant-Man', images: [getAvatar('Ant-Man', 'Marvel', 1)] },
  { name: 'Nick Fury', realName: 'Nicholas Joseph Fury', year: 1963, house: 'Marvel', biography: 'Súper espía estratega, ex Director de la organización S.H.I.E.L.D., y fundador de los Vengadores.', equipment: 'Parche en el ojo, Armas', images: [getAvatar('Nick Fury', 'Marvel', 1)] },
  { name: 'Groot', realName: 'Groot', year: 1960, house: 'Marvel', biography: 'Un individuo alienígena arbóreo sumamente poderoso, miembro de los Guardianes de la Galaxia.', equipment: 'Ninguno', images: [getAvatar('Groot', 'Marvel', 1)] },

  // DC
  { name: 'Batman', realName: 'Bruce Wayne', year: 1939, house: 'DC', biography: 'Un multimillonario estadounidense, playboy y filántropo que lucha contra el crimen en Gotham City.', equipment: 'Batsuit, Batarangs, Batmobile', images: [getAvatar('Batman', 'DC', 1), getAvatar('Batman', 'DC', 2)] },
  { name: 'Superman', realName: 'Clark Kent / Kal-El', year: 1938, house: 'DC', biography: 'Un alienígena extraterrestre del lejano Krypton que usa sus inmensos poderes para ser el héroe definitivo.', equipment: 'Traje Kryptoniano', images: [getAvatar('Superman', 'DC', 1)] },
  { name: 'Wonder Woman', realName: 'Diana Prince', year: 1941, house: 'DC', biography: 'Princesa amazona, guerrera experta y respetada líder fundadora de la Liga de la Justicia.', equipment: 'Lazo de la Verdad, Brazaletes', images: [getAvatar('Wonder Woman', 'DC', 1)] },
  { name: 'The Flash', realName: 'Barry Allen', year: 1956, house: 'DC', biography: 'Científico forense que tras un accidente químico obtuvo el inigualable poder de hipervelocidad y fuerza cinética.', equipment: 'Traje de Flash', images: [getAvatar('The Flash', 'DC', 1)] },
  { name: 'Aquaman', realName: 'Arthur Curry', year: 1941, house: 'DC', biography: 'El rey mitad humano y mitad atlante, defensor eterno de los inmensos misterios del mar.', equipment: 'Tridente de Neptuno', images: [getAvatar('Aquaman', 'DC', 1)] },
  { name: 'Green Lantern', realName: 'Hal Jordan', year: 1959, house: 'DC', biography: 'Un piloto audaz reclutado por los guardianes intergalácticos para defender a la tierra sin miedo.', equipment: 'Anillo de Poder, Batería', images: [getAvatar('Green Lantern', 'DC', 1)] },
  { name: 'Cyborg', realName: 'Victor Stone', year: 1980, house: 'DC', biography: 'Ex atleta modificado cibernéticamente para sobrevivir, logrando controlar sistemas a voluntad divina.', equipment: 'Mejoras cibernéticas y armamento láser', images: [getAvatar('Cyborg', 'DC', 1)] },
  { name: 'Shazam', realName: 'Billy Batson', year: 1940, house: 'DC', biography: 'Un joven puro de corazón que, al pronunciar un acrónimo mágico, recibe las fuerzas absolutas de siete dioses mitológicos.', equipment: 'Poder de los Dioses', images: [getAvatar('Shazam', 'DC', 1)] },
  { name: 'Harley Quinn', realName: 'Harleen Quinzel', year: 1992, house: 'DC', biography: 'Gimnasta acróbata y antigua psiquiatra manipulada cuyo comportamiento ahora es completamente desquiciado y antiheroico.', equipment: 'Bate de Béisbol, Mazo Fuerte', images: [getAvatar('Harley Quinn', 'DC', 1), getAvatar('Harley Quinn', 'DC', 2)] },
  { name: 'The Joker', realName: 'Desconocido', year: 1940, house: 'DC', biography: 'La eterna y maquiavélica némesis de Batman, una mente criminal siniestra caracterizada por su demencia como payaso.', equipment: 'Artilugios letales, Gas de la Risa', images: [getAvatar('The Joker', 'DC', 1)] },
  { name: 'Lex Luthor', realName: 'Alexander Luthor', year: 1940, house: 'DC', biography: 'Considerado el hombre más inteligente y poderoso del mundo, este villano humano desconfía intensamente de Superman.', equipment: 'Armadura Warsuit', images: [getAvatar('Lex Luthor', 'DC', 1)] },
  { name: 'Catwoman', realName: 'Selina Kyle', year: 1940, house: 'DC', biography: 'La ladrona con tematica de gato mas famosa de Gotham; es escurridiza, traicionera e inmensamente estratega.', equipment: 'Látigo Letal, Garras de Gato', images: [getAvatar('Catwoman', 'DC', 1)] },
  { name: 'Green Arrow', realName: 'Oliver Queen', year: 1941, house: 'DC', biography: 'Vigilante superhéroe multimillonario inspirado en Robin Hood, con extrema puntería a distancia.', equipment: 'Arco Largo, Múltiples Flechas Trucadas', images: [getAvatar('Green Arrow', 'DC', 1)] },
  { name: 'Martian Manhunter', realName: 'J\'onn J\'onzz', year: 1955, house: 'DC', biography: 'El último del pueblo marciano verde, telépata y metamorfo residente pacifico en el planeta Tierra.', equipment: 'Ninguno', images: [getAvatar('Martian Manhunter', 'DC', 1)] },
  { name: 'Nightwing', realName: 'Dick Grayson', year: 1984, house: 'DC', biography: 'El antiguo pupilo Robin superando a su maestro murciélago e independizado como defensor solista atlético.', equipment: 'Bastones de Escrima, Traje Avanzado', images: [getAvatar('Nightwing', 'DC', 1)] },
  { name: 'Black Adam', realName: 'Teth-Adam', year: 1945, house: 'DC', biography: 'Es un despiadado príncipe egipciano, contraparte oscura que comparte los inmensos dones recibidos por Shazam.', equipment: 'Poder de los Dioses Egipcios', images: [getAvatar('Black Adam', 'DC', 1)] },
  { name: 'Zatanna', realName: 'Zatanna Zatara', year: 1964, house: 'DC', biography: 'Profesional maga escénica e ilusionista que resulta emplear brujería real al enunciar sus verbos hacia atrás.', equipment: 'Varita Mágica de hechicera', images: [getAvatar('Zatanna', 'DC', 1)] },
  { name: 'Supergirl', realName: 'Kara Zor-El', year: 1959, house: 'DC', biography: 'Bajo el manto protector esta la propia prima de Superman, quien también expone fuerza al absorber radiación solar.', equipment: 'Traje de sol', images: [getAvatar('Supergirl', 'DC', 1)] },
  { name: 'Deathstroke', realName: 'Slade Wilson', year: 1980, house: 'DC', biography: 'Mercenario definitivo convertido en exterminador inparable, tras potenciar todas sus capacidades neuronales cerebral.', equipment: 'Espadas, Armas de fuego, Armadura Promethium', images: [getAvatar('Deathstroke', 'DC', 1)] },
  { name: 'Darkseid', realName: 'Uxas', year: 1970, house: 'DC', biography: 'Líder divino opresor y gobernante tiránico cuyo fin es arrancar de todo ser el poder del libre albedrío inminente.', equipment: 'Efecto Omega, Inmensa fuerza base', images: [getAvatar('Darkseid', 'DC', 1)] }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');
    
    await Hero.deleteMany({});
    console.log('Cleared existing heroes.');

    await Hero.insertMany(heroesData);
    console.log(`Successfully seeded ${heroesData.length} heroes.`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
