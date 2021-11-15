function calculate_factors(num_points)
  local buf = {}
  local p = 4
  floor_sqrt = math.floor( math.sqrt( num_points ) )
  local n = num_points
  repeat
    while n%p > 0 do
      if 		p == 4 then p = 2
      elseif 	p == 2 then p = 3
      else 					p = p + 2 end

      if p > floor_sqrt then p = n end
    end
    n = n / p
    table.insert(buf, p)
    table.insert(buf, n)
  until n <= 1
  return buf
end

print(calculate_factors(128 * 2 * 2 * 2 * 2)[2])