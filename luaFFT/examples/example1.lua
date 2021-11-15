luafft = require "luafft"

local signal = {}
local size = next_possible_size(44000 - 1)
local frequency = 44100
local T = 4096
local length = size / frequency
print(size);
print(length);

--Populates a list with random real numbers in complex format
function populate(list)
  for i=1,size do
	  list[i] = complex.new(math.sin(i / frequency * 2 * math.pi * 440) + (2 * math.sin(i / frequency * 2 * math.pi * 4880)), 0)
  end
end

--displays the fourier spectrum
function display(spectrum)
  for i=1,#spectrum/2 do print(string.format("%.1f Hz\t%1.1f",(i-1)/length, (spectrum[i]:abs()))) end
end

--displays a single list with whatever it contains
function print_list(list)
  for i,v in ipairs(list) do print(i,v) end
end

--devide a list with a certain constant factor
function devide(list, factor)
  for i,v in ipairs(list) do list[i] = list[i] / factor end
end


--create a signal with two sine waves
populate(signal)

--carry out fast fourier transformation and store result in "spec"
local spec = fft(signal, false)

--now carry out inverse fast fourier transformation and store result in "reconstructed"
reconstructed = fft(spec, true)

--After retransformation, we need to devide by the data size
--devide(reconstructed, size)
devide(spec, size/2)

--Displays the fourier spectrum of the audio signal
display(spec)

