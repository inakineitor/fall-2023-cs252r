#lang scheme

(define append
  (lambda (l m)
    (if (null? l) m
      (cons (car l) (append (cdr l) m))
    )
  )
)

; (define take
;   (lambda (lst n)
;     (if (eq? n 0)
;       '()
;       (cons (car lst) (take (cdr lst) (- n 1)))
;     )
;   )
; )

(define take
  (lambda (lst n)
    (reverse
      (cdr
        (foldr
          (lambda (e acc)
            (if (= (car acc) n)
              acc
              (cons
                (add1 (car acc))
                (cons e (cdr acc))
              )
            )
          )
          '(0 . ())
          (reverse lst)
        )
      )
    )
  )
)

(define reverse
  (lambda (l)
    (if (null? l)
      '()
      (append (reverse (cdr l)) (list (car l)))
    )
  )
)

(define repeat
  (lambda (str n)
    (if (eq? n 0)
      '()
      (append str (repeat str (- n 1)))
    )
  )
)

(define left take)
(define right (lambda (str n) (reverse (take (reverse str) n))))
(define concatenate append)

(left '(1 2 3) 2)
(right '(1 2 3) 2)
(left '() 2)