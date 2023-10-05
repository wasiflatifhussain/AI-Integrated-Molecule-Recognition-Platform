def generate_permutations(arr, index=0, current_permutation=[]):
    # If we have iterated through all subarrays, print the current permutation
    if index == len(arr):
        print(current_permutation)
        print(len(current_permutation))
        return
    
    # Iterate through the elements in the current subarray
    for element in arr[index]:
        # Add the current element to the current permutation
        current_permutation.append(element)
        
        # Recursively generate permutations for the remaining subarrays
        generate_permutations(arr, index + 1, current_permutation)
        
        # Backtrack by removing the last element from the current permutation
        current_permutation.pop()

# Input array
input_array = [
    [128.062600256, 166.07022862399998, 168.08132432],
    [118.041864812],
    [134.019021192],
    [168.057514876, 184.034671256]
]

input_array = [
    [
        128.062600256,
        166.07022862399998,
        168.08132432
    ],
    [
        118.041864812,
        166.07022862399998,
        118.041864812,
        134.019021192
    ],
    [
        134.019021192,
        166.07022862399998,
        128.062600256,
        118.041864812
    ],
    [
        168.057514876,
        184.034671256,
        168.08132432,
        184.034671256
    ],
    [
        166.07022862399998,
        128.062600256,
        118.041864812
    ],
    [
        118.041864812,
        166.07022862399998
    ],
    [
        184.034671256,
        168.057514876
    ]
]

input_array = [
    [
        128.062600256,
        166.07022862399998,
        118.041864812,
        134.019021192
    ],
    [
        166.07022862399998,
        166.07022862399998,
        118.041864812
    ],
    [
        134.019021192,
        168.057514876
    ],
    [
        168.08132432,
        184.034671256
    ],
    [
        134.019021192,
        168.057514876
    ],
    [
        128.062600256,
        166.07022862399998,
        118.041864812,
        134.019021192
    ],
    [
        168.08132432,
        168.08132432,
        134.019021192
    ]
]

# Start generating permutations from index 0
generate_permutations(input_array)
