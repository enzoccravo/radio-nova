-- Add the new column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_main_featured boolean DEFAULT false;

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'inauguracion-nuevo-puente-paso-de-los-libres',
  'locales',
  'Inauguraron la remodelación del puente internacional que une Paso de los Libres con Uruguayana',
  'Conectividad regional',
  'La obra, que demandó más de 18 meses de trabajo, mejora significativamente la infraestructura vial y refuerza los lazos entre ambas ciudades fronterizas.',
  '<p>Las autoridades de Paso de los Libres y Uruguayana se reunieron este martes para inaugurar oficialmente la remodelación del puente internacional que conecta ambas localidades.</p><p>La obra, que demandó una inversión de más de 500 millones de pesos, incluyó la ampliación de carriles, mejoras en la iluminación y la instalación de un nuevo sistema de control aduanero que promete agilizar el cruce fronterizo.</p><p>"Este puente no solo conecta dos ciudades, sino que representa la hermandad entre dos pueblos que comparten historia y cultura", expresó el intendente durante el acto inaugural.</p><p>Los comerciantes de la zona celebraron la noticia, ya que esperan un incremento significativo en el flujo comercial y turístico entre ambos países. La remodelación también incorporó una ciclovía y una pasarela peatonal accesible.</p><p>Se estima que el tránsito por el puente podría aumentar hasta un 40% una vez que las nuevas instalaciones estén plenamente operativas.</p>',
  'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800&h=500&fit=crop',
  'Redacción Radio Nova',
  true,
  true,
  true
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'nuevo-plan-viviendas-corrientes',
  'politica',
  'La provincia anunció un ambicioso plan de viviendas para localidades del interior correntino',
  'Política habitacional',
  'El gobernador presentó un plan que contempla la construcción de 2.000 viviendas en distintas localidades de Corrientes, con especial foco en la zona de la frontera.',
  '<p>El gobernador de Corrientes presentó este lunes un nuevo plan habitacional que prevé la construcción de 2.000 viviendas a lo largo de los próximos tres años, con prioridad para las localidades del interior provincial.</p><p>Paso de los Libres se encuentra entre las ciudades beneficiadas, con una asignación inicial de 180 unidades que serán construidas en terrenos fiscales ya relevados por el municipio.</p><p>El plan contempla distintos modelos de vivienda adaptados a las necesidades de cada zona, con superficies que van desde los 55 hasta los 85 metros cuadrados.</p><p>"Es fundamental que nuestros vecinos puedan acceder a una vivienda digna sin tener que migrar a las grandes ciudades", destacó el mandatario provincial durante la presentación realizada en Casa de Gobierno.</p><p>Los interesados podrán inscribirse a partir del próximo mes a través de la página del Instituto Provincial de la Vivienda.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
  'María González',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'torneo-futbol-regional-paso-libres',
  'deportes',
  'Arranca el torneo regional de fútbol con la participación de 16 equipos de la zona',
  'Fútbol regional',
  'El certamen deportivo más esperado del año reúne a los mejores clubes de Paso de los Libres, Monte Caseros y localidades vecinas.',
  '<p>Este fin de semana arranca oficialmente el Torneo Regional de Fútbol que reúne a 16 equipos de Paso de los Libres, Monte Caseros, Alvear y localidades aledañas.</p><p>La competencia, organizada por la Liga Regional del Litoral, se disputará en formato de grupos con partidos de ida y vuelta, y culminará con una final que se prevé para mediados de noviembre.</p><p>Entre los equipos favoritos se encuentran el Club Deportivo Libreño, que viene de una temporada destacada, y el tradicional Club Sportivo Monte Caseros, bicampeón del torneo anterior.</p><p>Las canchas de los clubes participantes fueron acondicionadas durante las últimas semanas para recibir a los hinchas en las mejores condiciones.</p><p>"El fútbol regional es la pasión de nuestra gente. Esperamos un torneo competitivo y con mucho público", señaló el presidente de la Liga.</p>',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=500&fit=crop',
  'Carlos Ramírez',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'precio-arroz-sube-corrientes',
  'economia',
  'El precio del arroz correntino registró un aumento del 15% en el último trimestre',
  'Economía regional',
  'Los productores arroceros de la provincia enfrentan un escenario de costos crecientes, aunque las exportaciones se mantienen firmes.',
  '<p>El precio del arroz producido en Corrientes experimentó un aumento del 15% durante el último trimestre, según datos del Instituto Nacional de Tecnología Agropecuaria.</p><p>Los productores de la zona de Paso de los Libres, una de las principales regiones arroceras del país, señalaron que los incrementos obedecen al alza de insumos como combustibles y fertilizantes.</p><p>Pese a la suba de costos, las exportaciones de arroz correntino se mantienen firmes, con Brasil como principal destino comercial.</p><p>"La calidad del arroz de nuestra zona es reconocida internacionalmente, y eso nos permite mantener buenos precios de exportación", explicó un referente de la Asociación de Productores Arroceros.</p><p>Se espera que la próxima cosecha, prevista para marzo, muestre rendimientos superiores a los del año anterior gracias a las condiciones climáticas favorables.</p>',
  'https://images.unsplash.com/photo-1536304993881-460e32f50069?w=800&h=500&fit=crop',
  'Redacción Radio Nova',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'festival-carnaval-paso-libres-2026',
  'cultura',
  'Se conocieron las fechas del Carnaval de Paso de los Libres 2027: será en febrero con cinco noches',
  'Cultura y espectáculos',
  'El carnaval más importante del litoral argentino ya tiene fecha confirmada y promete ser el más grande de los últimos años.',
  '<p>La Comisión de Carnaval de Paso de los Libres confirmó las fechas del evento más importante de la ciudad: el Carnaval 2027 se realizará durante cinco noches consecutivas en el mes de febrero.</p><p>El corsódromo local, con capacidad para más de 15.000 espectadores, será nuevamente el escenario principal donde las comparsas desplegarán sus trajes, carrozas y coreografías.</p><p>"Paso de los Libres tiene el carnaval más importante del litoral argentino y uno de los más reconocidos del país. Estamos trabajando para que la edición 2027 sea inolvidable", anunció el presidente de la comisión organizadora.</p><p>Las comparsas ya comenzaron los preparativos con ensayos y la confección de vestuarios, generando un importante movimiento económico en la ciudad.</p><p>Se espera la visita de más de 50.000 turistas durante las cinco noches del evento, lo que representa un impacto económico significativo para la ciudad y la región.</p>',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
  'Laura Fernández',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'operativo-seguridad-ruta-117',
  'policiales',
  'Refuerzan los controles de seguridad sobre la Ruta 117 con nuevos puestos de vigilancia',
  'Seguridad vial',
  'La Policía provincial instaló tres nuevos puestos de control sobre la Ruta 117, principal vía de acceso a la ciudad.',
  '<p>La Policía de Corrientes anunció la instalación de tres nuevos puestos de control sobre la Ruta Nacional 117, principal vía de acceso a Paso de los Libres desde el interior provincial.</p><p>Los puestos operarán las 24 horas y contarán con tecnología de reconocimiento de patentes y sistemas de comunicación de última generación.</p><p>"El objetivo es mejorar la seguridad vial y prevenir el ingreso de vehículos con irregularidades", explicó el comisario a cargo del operativo.</p><p>La medida surge tras un incremento en los controles fronterizos y forma parte de un plan integral de seguridad que también incluye la incorporación de cámaras de vigilancia en puntos estratégicos de la ciudad.</p><p>Los vecinos recibieron positivamente la noticia, aunque algunos expresaron su preocupación por las posibles demoras que podrían generarse en los accesos durante las horas pico.</p>',
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=500&fit=crop',
  'Redacción Radio Nova',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'nueva-sala-hospital-paso-libres',
  'locales',
  'El hospital de Paso de los Libres inauguró una nueva sala de emergencias completamente equipada',
  'Salud pública',
  'La nueva sala duplica la capacidad de atención y cuenta con equipamiento de última generación para emergencias médicas.',
  '<p>El Hospital San José de Paso de los Libres inauguró este miércoles una nueva sala de emergencias que duplica la capacidad de atención del centro de salud más importante de la ciudad.</p><p>La obra, financiada con fondos provinciales y nacionales, incluyó la incorporación de equipamiento de última generación, incluyendo un tomógrafo y un equipo de rayos X digital.</p><p>"Esta nueva sala nos permite dar una respuesta más rápida y eficiente a las emergencias de nuestra comunidad", destacó el director del hospital.</p><p>La sala cuenta con 12 camas de internación, 4 boxes de atención y un quirófano de urgencias, además de una sala de espera renovada para los familiares de los pacientes.</p><p>El personal médico y de enfermería recibió capacitación específica para el manejo de los nuevos equipos durante las semanas previas a la inauguración.</p>',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
  'Ana Martínez',
  true,
  false,
  false
);

INSERT INTO articles (slug, category, title, subtitle, excerpt, body, image, author, published, featured, is_main_featured)
VALUES (
  'escuela-tecnica-robotica',
  'locales',
  'Estudiantes de la Escuela Técnica de Paso de los Libres ganaron un concurso nacional de robótica',
  'Educación y tecnología',
  'Los jóvenes libreños se impusieron ante más de 200 equipos de todo el país con un robot diseñado para tareas agrícolas.',
  '<p>Un grupo de estudiantes de la Escuela Técnica N°1 de Paso de los Libres se consagró campeón en el Concurso Nacional de Robótica Educativa que se realizó en Buenos Aires.</p><p>El equipo, conformado por cinco alumnos de quinto y sexto año, presentó un prototipo de robot autónomo diseñado para asistir en tareas agrícolas, particularmente en el monitoreo de cultivos de arroz.</p><p>"Quisimos desarrollar algo que tuviera un impacto real en nuestra comunidad, y el arroz es la actividad económica más importante de la zona", explicó uno de los jóvenes participantes.</p><p>El robot utiliza sensores de humedad y temperatura, y puede recorrer los campos de forma autónoma, enviando datos en tiempo real al productor a través de una aplicación móvil.</p><p>Los docentes que acompañaron al equipo destacaron el esfuerzo y dedicación de los estudiantes, que trabajaron durante más de seis meses en el desarrollo del prototipo.</p>',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
  'Redacción Radio Nova',
  true,
  false,
  false
);