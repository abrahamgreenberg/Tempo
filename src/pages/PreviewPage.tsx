import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hooks"
import {
  selectAllItemTimes,
  selectColumns,
  selectLinks,
} from "@/store/boardSelectors"
import { useNavigate } from "react-router-dom"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer"

const SUBWAY_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
  "#EC4899",
]

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 30,
    paddingHorizontal: 28,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    color: "#111827",
  },
  slotBlock: {
    marginBottom: 14,
  },
  slotTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1F2937",
    marginBottom: 8,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  circleText: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flexGrow: 1,
  },
  bulletTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "",
    fontWeight: 100,
  },
  bulletMeta: {
    fontSize: 10,
    color: "#4B5563",
  },
  empty: {
    fontSize: 11,
    color: "#6B7280",
  },
})

type PreviewPoint = {
  id: string
  marker: string
  color: string
  title: string
  meta: string
}

type TimeslotGroup = {
  id: string
  title: string
  points: PreviewPoint[]
}

function pickColor(seed: string, index: number) {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return SUBWAY_COLORS[(hash + index) % SUBWAY_COLORS.length]
}

function getAlphabetMarker(index: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let n = index
  let result = ""

  do {
    result = letters[n % 26] + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)

  return result
}

function BoardPreviewDocument({ groups }: { groups: TimeslotGroup[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Final Timetable</Text>

        {groups.length === 0 ? (
          <Text style={styles.empty}>
            No tasks yet. Add tasks in Edit Board.
          </Text>
        ) : (
          <View>
            {groups.map((group) => (
              <View key={group.id} style={styles.slotBlock}>
                <Text style={styles.slotTitle}>{group.title}</Text>
                <View style={styles.list}>
                  {group.points.map((point) => (
                    <View key={point.id} style={styles.row} wrap={false}>
                      <View
                        style={[
                          styles.circle,
                          { backgroundColor: point.color },
                        ]}
                      >
                        <Text style={styles.circleText}>{point.marker}</Text>
                      </View>
                      <View style={styles.content}>
                        <Text style={styles.bulletTitle}>{point.title}</Text>
                        <Text style={styles.bulletMeta}>{point.meta}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

export function PreviewPage() {
  const navigate = useNavigate()
  const columns = useAppSelector(selectColumns)
  const links = useAppSelector(selectLinks)
  const items = useAppSelector((state) => state.board.items)
  const itemTimes = useAppSelector(selectAllItemTimes)

  const sortedColumns = Object.values(columns).sort(
    (a, b) => a.startTime.toMinutes() - b.startTime.toMinutes()
  )

  let markerIndex = 0

  const groups: TimeslotGroup[] = sortedColumns
    .map((column) => {
      const points = Object.values(links)
        .filter((link) => link.columnId === column.id)
        .sort((a, b) => a.rank - b.rank)
        .map((link) => {
          const item = items[link.itemId]
          const times = itemTimes[link.itemId]

          if (!item || !times) return null

          const point: PreviewPoint = {
            id: link.itemId,
            marker: getAlphabetMarker(markerIndex++),
            color: pickColor(link.itemId, markerIndex),
            title: `${item.name} (${times.startTime.toString()} - ${times.endTime.toString()})`,
            meta: `${times.startTime.toString()} - ${times.endTime.toString()}  •  ${item.durationMinutes} min `,
          }

          return point
        })
        .filter((point): point is PreviewPoint => point != null)

      if (points.length === 0) return null

      return {
        id: column.id,
        title: `${column.name} (${column.startTime.toString()} - ${column.endTime.toString()})`,
        points,
      }
    })
    .filter((group): group is TimeslotGroup => group != null)

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
            <BoardPreviewDocument groups={groups} />
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}
