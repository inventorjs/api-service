import { Subject, switchMap, Observable } from 'rxjs'

const subject = new Subject()

subject.pipe(switchMap((title) => request(title))).subscribe((content) => {
    console.log(content)
})

function request(title) {
   const obs = new Observable((subs) => {
	const delay = title === 'aaa' ? 5000 : 1000
	setTimeout(() => {
          subs.next(title + '-content')	
	}, delay)
   })
   return obs
}

subject.next('aaa')
subject.next('bbb')
