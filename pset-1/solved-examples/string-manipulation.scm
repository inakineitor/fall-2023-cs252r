#lang scheme
(require scheme/include)
(require "../string-manipulation-dsl.scm")

; ===== Example 1 =====
(define example1
  (lambda (x)
    (left x 1)
  )
)

(example1 (string->list "hello"))
(example1 (string->list "world"))

; ===== Example 2 =====
(define example2
  (lambda (x)
    (right x 1)
  )
)

(example2 (string->list "hello"))
(example2 (string->list "world"))

; ===== Example 3 =====
(define example3
  (lambda (x y)
    (concatenate x y)
  )
)

(example3 (string->list "hello") (string->list "you"))
(example3 (string->list "world") (string->list "domination"))

; ===== Example 4 =====
(define example4
  (lambda (x y)
    (concatenate 
      (concatenate x #\space)
      y
    )
  )
)

(example4 (string->list "hello") (string->list "you"))
(example4 (string->list "world") (string->list "domination"))

; ===== Example 5 =====
(define example5
  (lambda (x)
    (concatenate 
      (left x 1)
      (right x 1)
    )
  )
)

(example5 (string->list "hello"))
(example5 (string->list "world"))
(example5 (string->list "domination"))