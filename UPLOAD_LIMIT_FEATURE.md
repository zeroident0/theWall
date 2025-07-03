# Daily Upload Limit Feature

## Overview

The application now includes a daily upload limit of 3 pictures per device, tracked by IP address. This feature helps prevent spam and ensures fair usage of the wall.

## How It Works

### IP Address Detection
- Uses the `ipify.org` API to detect the user's IP address
- IP address is cached to avoid repeated API calls
- Falls back to "unknown" if the service is unavailable

### Daily Limit Tracking
- Tracks uploads in a Firestore collection called `daily_uploads`
- Each upload record contains:
  - IP address of the uploader
  - Date (YYYY-MM-DD format)
  - Timestamp of the upload
- Limits are reset daily at midnight UTC

### User Interface
- **Upload Limit Display**: Shows remaining uploads for the day
  - Located in the top-left corner
  - Shows progress bar indicating usage
  - Changes color when limit is reached
- **Upload Button**: 
  - Disabled when limit is reached
  - Shows tooltip with limit information
  - Changes appearance to indicate disabled state

## Technical Implementation

### Services Created

1. **`src/services/ipService.js`**
   - `getUserIP()`: Fetches and caches user's IP address
   - `clearIPCache()`: Clears cached IP address

2. **`src/services/limitService.js`**
   - `canUserUpload()`: Checks if user can upload (returns limit status)
   - `recordUpload()`: Records an upload for limit tracking
   - `getUserUploadStats()`: Gets current upload statistics

3. **`src/components/UploadLimitDisplay.jsx`**
   - Displays current upload limit status
   - Auto-refreshes every minute
   - Shows visual progress bar

### Database Schema

**Collection: `daily_uploads`**
```javascript
{
  ip: "string",           // User's IP address
  date: "string",         // Date in YYYY-MM-DD format
  timestamp: "string"     // ISO timestamp
}
```

### Error Handling

- **Network Issues**: Falls back to allowing uploads if IP service fails
- **Database Issues**: Falls back to allowing uploads if Firestore is unavailable
- **Limit Reached**: Shows clear error message with remaining count

## User Experience

### Normal Usage
1. User sees upload limit display showing remaining uploads
2. Upload button is enabled and functional
3. After each upload, limit display updates automatically

### Limit Reached
1. Upload button becomes disabled (red color)
2. Hover tooltip shows limit message
3. Upload limit display shows "Daily limit reached"
4. Any attempt to upload shows alert with limit information

### Visual Indicators
- **Green progress bar**: Normal usage
- **Red progress bar**: Limit reached
- **Disabled upload button**: Cannot upload more today
- **Real-time updates**: Limit display refreshes automatically

## Configuration

The daily limit is currently set to **3 uploads per day per IP address**. To change this limit:

1. Update the limit check in `src/services/limitService.js`:
   ```javascript
   // Change from 3 to desired limit
   canUpload: uploadCount < 3
   ```

2. Update the remaining calculation:
   ```javascript
   remaining: Math.max(0, 3 - uploadCount)
   ```

3. Update the progress bar calculation in `UploadLimitDisplay.jsx`:
   ```javascript
   style={{ width: `${(uploadStats.uploadCount / 3) * 100}%` }}
   ```

## Security Considerations

- IP addresses are stored in Firestore for limit tracking
- No personal information is collected beyond IP address
- Limits are enforced server-side in the storage service
- Graceful fallback if tracking services are unavailable

## Testing

To test the feature:

1. Upload 3 images to reach the daily limit
2. Verify the upload button becomes disabled
3. Verify the limit display shows "Daily limit reached"
4. Wait until the next day to verify limits reset
5. Test with different IP addresses (VPN, mobile data, etc.)

## Troubleshooting

### Common Issues

1. **Limit not updating**: Check Firestore connection and permissions
2. **IP detection failing**: Check network connectivity to ipify.org
3. **Button not disabling**: Verify the limit service is working correctly

### Debug Commands

Open browser console and run:
```javascript
// Check current upload stats
import { getUserUploadStats } from './src/services/limitService.js';
getUserUploadStats().then(console.log);

// Check IP address
import { getUserIP } from './src/services/ipService.js';
getUserIP().then(console.log);
``` 