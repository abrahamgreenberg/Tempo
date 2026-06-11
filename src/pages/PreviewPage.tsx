import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer"

// Register fonts
Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
})

// Styles
const styles = StyleSheet.create({
  titleBlock: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "Oswald",
    textAlign: "center",
    color: "#2c1810",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#8B4513",
    width: 60,
    marginVertical: 16,
    alignSelf: "center",
  },
  author: {
    fontSize: 13,
    textAlign: "center",
    color: "#8B4513",
    fontFamily: "Times-Roman",
    fontStyle: "italic",
  },
  body: {
    paddingTop: 50,
    paddingBottom: 65,
    paddingHorizontal: 65,
  },
  header: {
    fontSize: 8,
    marginBottom: 24,
    textAlign: "center",
    color: "#999",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  chapterHeading: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  chapterNumber: {
    fontSize: 36,
    fontFamily: "Oswald",
    color: "#8B4513",
    marginBottom: 8,
  },
  chapterRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#8B4513",
    width: 40,
    marginVertical: 8,
  },
  chapterTitle: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    fontStyle: "italic",
    textAlign: "center",
    color: "#555",
    maxWidth: 320,
    lineHeight: 1.6,
  },
  text: {
    marginBottom: 10,
    fontSize: 11,
    textAlign: "justify",
    fontFamily: "Times-Roman",
    lineHeight: 1.7,
    color: "#333",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#999",
  },
})

// Components
const HR = () => <View style={styles.hr} />

const ChapterHeading = ({
  number,
  children,
  ...props
}: {
  number: string
  children: React.ReactNode
}) => (
  <View style={styles.chapterHeading} {...props}>
    <Text style={styles.chapterNumber}>{number}</Text>
    <View style={styles.chapterRule} />
    <Text style={styles.chapterTitle}>{children}</Text>
    <View style={styles.chapterRule} />
  </View>
)

const Quixote = () => (
  <Document>
    <Page style={styles.body}>
      <Text style={styles.header} fixed>
        Don Quijote de la Mancha
      </Text>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Don Quijote de la Mancha</Text>
        <HR />
        <Text style={styles.author}>Miguel de Cervantes</Text>
      </View>

      <ChapterHeading number="I">
        Que trata de la condición y ejercicio del famoso hidalgo D. Quijote de
        la Mancha
      </ChapterHeading>

      <Text style={styles.text}>
        En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha
        mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga
        antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que
        carnero, salpicón las más noches, duelos y quebrantos los sábados,
        lentejas los viernes, algún palomino de añadidura los domingos,
        consumían las tres partes de su hacienda. El resto della concluían sayo
        de velarte, calzas de velludo para las fiestas con sus pantuflos de lo
        mismo, los días de entre semana se honraba con su vellori de lo más
        fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina
        que no llegaba a los veinte, y un mozo de campo y plaza, que así
        ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro
        hidalgo con los cincuenta años, era de complexión recia, seco de carnes,
        enjuto de rostro; gran madrugador y amigo de la caza. Quieren decir que
        tenía el sobrenombre de Quijada o Quesada (que en esto hay alguna
        diferencia en los autores que deste caso escriben), aunque por
        conjeturas verosímiles se deja entender que se llama Quijana; pero esto
        importa poco a nuestro cuento; basta que en la narración dél no se salga
        un punto de la verdad.
      </Text>
      <Text style={styles.text}>
        Es, pues, de saber, que este sobredicho hidalgo, los ratos que estaba
        ocioso (que eran los más del año) se daba a leer libros de caballerías
        con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de
        la caza, y aun la administración de su hacienda; y llegó a tanto su
        curiosidad y desatino en esto, que vendió muchas hanegas de tierra de
        sembradura, para comprar libros de caballerías en que leer; y así llevó
        a su casa todos cuantos pudo haber dellos; y de todos ningunos le
        parecían tan bien como los que compuso el famoso Feliciano de Silva:
        porque la claridad de su prosa, y aquellas intrincadas razones suyas, le
        parecían de perlas; y más cuando llegaba a leer aquellos requiebros y
        cartas de desafío, donde en muchas partes hallaba escrito: la razón de
        la sinrazón que a mi razón se hace, de tal manera mi razón enflaquece,
        que con razón me quejo de la vuestra fermosura, y también cuando leía:
        los altos cielos que de vuestra divinidad divinamente con las estrellas
        se fortifican, y os hacen merecedora del merecimiento que merece la
        vuestra grandeza.
      </Text>

      <ChapterHeading number="II">
        Que trata de la primera salida que de su tierra hizo el ingenioso Don
        Quijote
      </ChapterHeading>

      <Text
        style={styles.pageNumber}
        render={({
          pageNumber,
          totalPages,
        }: {
          pageNumber: number
          totalPages: number
        }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
)

export function PreviewPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">PDF Preview</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/app")} variant="outline">
              ← Home
            </Button>
            <Button onClick={() => navigate("/app/edit")} variant="outline">
              Edit Board
            </Button>
          </div>
        </div>

        <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-border/70 bg-background/95 shadow-lg">
          <PDFViewer width="100%" height="100%" showToolbar={true}>
            <Quixote />
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}
