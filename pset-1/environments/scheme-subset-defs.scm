(define empty '())

(define cadr
  (lambda (l)
    (car (cdr l))
  )
)

(define append
  (lambda (l m)
    (if (null? l) m
      (cons (car l) (append (cdr l) m))
    )
  )
)

(define add1
  (lambda (n)
    (+ n 1)
  )
)