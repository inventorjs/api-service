import { of, mergeMap, interval, map, delay } from 'rxjs'

const letters = of(1, 2, 3).pipe(
  map((v) => {
    console.log(v, 'xx', Date.now())
    return v + '-outer'
  }),
  delay(10000),
)
// const result = letters.pipe(
//   mergeMap((x) => interval(1000)),
// )

letters.subscribe((x) => console.log(x, Date.now()))
